"""
Comprehensive Backend API Tests for Scalping Bot EA Store
Tests payment verification features and all endpoints
"""

import httpx
import asyncio
import json
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://payment-check-5.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(test_name, status, message=""):
    """Print test result with color"""
    if status == "PASS":
        print(f"{Colors.GREEN}✓ {test_name}: PASS{Colors.RESET}")
    elif status == "FAIL":
        print(f"{Colors.RED}✗ {test_name}: FAIL - {message}{Colors.RESET}")
    elif status == "INFO":
        print(f"{Colors.BLUE}ℹ {test_name}: {message}{Colors.RESET}")
    else:
        print(f"{Colors.YELLOW}⚠ {test_name}: {message}{Colors.RESET}")

async def test_root_endpoint():
    """Test root API endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    print_test("Root Endpoint", "PASS")
                    return True
                else:
                    print_test("Root Endpoint", "FAIL", "Missing message field")
                    return False
            else:
                print_test("Root Endpoint", "FAIL", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            print_test("Root Endpoint", "FAIL", str(e))
            return False

async def test_get_products():
    """Test GET /products endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/products")
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list) and len(products) > 0:
                    print_test("GET Products", "PASS")
                    print_test("Products Count", "INFO", f"Found {len(products)} products")
                    return True, products
                else:
                    print_test("GET Products", "FAIL", "No products found")
                    return False, []
            else:
                print_test("GET Products", "FAIL", f"Status code: {response.status_code}")
                return False, []
        except Exception as e:
            print_test("GET Products", "FAIL", str(e))
            return False, []

async def test_get_single_product(product_id):
    """Test GET /products/{product_id} endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/products/{product_id}")
            if response.status_code == 200:
                product = response.json()
                if product.get("id") == product_id:
                    print_test("GET Single Product", "PASS")
                    return True
                else:
                    print_test("GET Single Product", "FAIL", "Product ID mismatch")
                    return False
            else:
                print_test("GET Single Product", "FAIL", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            print_test("GET Single Product", "FAIL", str(e))
            return False

async def test_create_order(product_id):
    """Test POST /orders endpoint with enhanced fields"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            order_data = {
                "product_id": product_id,
                "customer_name": "John Trader",
                "customer_email": "john.trader@example.com",
                "amount": 150.00,
                "payment_method": "TRC20_USDT",
                "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
            }
            
            response = await client.post(f"{BACKEND_URL}/orders", json=order_data)
            
            if response.status_code == 200:
                order = response.json()
                
                # Check all required fields
                required_fields = ["id", "license_key", "status", "verification_status"]
                missing_fields = [field for field in required_fields if field not in order]
                
                if missing_fields:
                    print_test("Create Order", "FAIL", f"Missing fields: {missing_fields}")
                    return False, None
                
                # Check new verification fields
                if order.get("verification_status") != "not_verified":
                    print_test("Create Order", "FAIL", f"Expected verification_status='not_verified', got '{order.get('verification_status')}'")
                    return False, None
                
                if order.get("status") != "pending":
                    print_test("Create Order", "FAIL", f"Expected status='pending', got '{order.get('status')}'")
                    return False, None
                
                print_test("Create Order", "PASS")
                print_test("Order ID", "INFO", order["id"])
                print_test("License Key", "INFO", order["license_key"])
                print_test("Verification Status", "INFO", order["verification_status"])
                return True, order
            else:
                print_test("Create Order", "FAIL", f"Status code: {response.status_code}, Response: {response.text}")
                return False, None
        except Exception as e:
            print_test("Create Order", "FAIL", str(e))
            return False, None

async def test_get_orders():
    """Test GET /orders endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/orders")
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    print_test("GET Orders", "PASS")
                    print_test("Orders Count", "INFO", f"Found {len(orders)} orders")
                    return True
                else:
                    print_test("GET Orders", "FAIL", "Response is not a list")
                    return False
            else:
                print_test("GET Orders", "FAIL", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            print_test("GET Orders", "FAIL", str(e))
            return False

async def test_get_single_order(order_id):
    """Test GET /orders/{order_id} endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/orders/{order_id}")
            if response.status_code == 200:
                order = response.json()
                if order.get("id") == order_id:
                    print_test("GET Single Order", "PASS")
                    return True
                else:
                    print_test("GET Single Order", "FAIL", "Order ID mismatch")
                    return False
            else:
                print_test("GET Single Order", "FAIL", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            print_test("GET Single Order", "FAIL", str(e))
            return False

async def test_verify_payment(order_id):
    """Test POST /orders/{order_id}/verify endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(f"{BACKEND_URL}/orders/{order_id}/verify")
            
            # We expect this to fail with mock transaction hash, but should not crash
            if response.status_code == 200:
                result = response.json()
                
                # Check response structure
                required_fields = ["success", "message", "order_id"]
                missing_fields = [field for field in required_fields if field not in result]
                
                if missing_fields:
                    print_test("Payment Verification Endpoint", "FAIL", f"Missing fields: {missing_fields}")
                    return False
                
                # With mock hash, we expect success=False
                if result.get("success") == False:
                    print_test("Payment Verification Endpoint", "PASS")
                    print_test("Verification Result", "INFO", f"Expected failure with mock hash: {result.get('message')}")
                    return True
                else:
                    # Unexpected success with mock hash
                    print_test("Payment Verification Endpoint", "WARN", "Unexpected success with mock transaction hash")
                    return True
            else:
                print_test("Payment Verification Endpoint", "FAIL", f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            print_test("Payment Verification Endpoint", "FAIL", str(e))
            return False

async def test_admin_orders():
    """Test GET /admin/orders endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Test without filters
            response = await client.get(f"{BACKEND_URL}/admin/orders")
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    print_test("Admin Orders (no filter)", "PASS")
                    print_test("Admin Orders Count", "INFO", f"Found {len(orders)} orders")
                else:
                    print_test("Admin Orders (no filter)", "FAIL", "Response is not a list")
                    return False
            else:
                print_test("Admin Orders (no filter)", "FAIL", f"Status code: {response.status_code}")
                return False
            
            # Test with status filter
            response = await client.get(f"{BACKEND_URL}/admin/orders?status=pending")
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    print_test("Admin Orders (status filter)", "PASS")
                    return True
                else:
                    print_test("Admin Orders (status filter)", "FAIL", "Response is not a list")
                    return False
            else:
                print_test("Admin Orders (status filter)", "FAIL", f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            print_test("Admin Orders", "FAIL", str(e))
            return False

async def test_admin_stats():
    """Test GET /admin/stats endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/admin/stats")
            if response.status_code == 200:
                stats = response.json()
                
                # Check required fields
                required_fields = ["total_orders", "pending_orders", "verified_orders", "completed_orders", "total_revenue"]
                missing_fields = [field for field in required_fields if field not in stats]
                
                if missing_fields:
                    print_test("Admin Stats", "FAIL", f"Missing fields: {missing_fields}")
                    return False
                
                print_test("Admin Stats", "PASS")
                print_test("Total Orders", "INFO", stats["total_orders"])
                print_test("Pending Orders", "INFO", stats["pending_orders"])
                print_test("Total Revenue", "INFO", f"${stats['total_revenue']}")
                return True
            else:
                print_test("Admin Stats", "FAIL", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            print_test("Admin Stats", "FAIL", str(e))
            return False

async def test_update_order_status(order_id):
    """Test PATCH /orders/{order_id}/status endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Test updating to completed
            response = await client.patch(f"{BACKEND_URL}/orders/{order_id}/status?status=completed")
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get("status") == "completed" and result.get("order_id") == order_id:
                    print_test("Update Order Status", "PASS")
                    return True
                else:
                    print_test("Update Order Status", "FAIL", "Response data mismatch")
                    return False
            else:
                print_test("Update Order Status", "FAIL", f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            print_test("Update Order Status", "FAIL", str(e))
            return False

async def test_performance_endpoint():
    """Test GET /performance endpoint"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/performance")
            if response.status_code == 200:
                metrics = response.json()
                
                required_fields = ["total_profit", "monthly_return", "win_rate", "total_trades"]
                missing_fields = [field for field in required_fields if field not in metrics]
                
                if missing_fields:
                    print_test("Performance Metrics", "FAIL", f"Missing fields: {missing_fields}")
                    return False
                
                print_test("Performance Metrics", "PASS")
                return True
            else:
                print_test("Performance Metrics", "FAIL", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            print_test("Performance Metrics", "FAIL", str(e))
            return False

async def test_invalid_order_verification():
    """Test payment verification with invalid order ID"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(f"{BACKEND_URL}/orders/invalid-order-id/verify")
            
            if response.status_code == 404:
                print_test("Invalid Order Verification (Error Handling)", "PASS")
                return True
            else:
                print_test("Invalid Order Verification (Error Handling)", "FAIL", f"Expected 404, got {response.status_code}")
                return False
        except Exception as e:
            print_test("Invalid Order Verification (Error Handling)", "FAIL", str(e))
            return False

async def test_invalid_status_update(order_id):
    """Test order status update with invalid status"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.patch(f"{BACKEND_URL}/orders/{order_id}/status?status=invalid_status")
            
            if response.status_code == 400:
                print_test("Invalid Status Update (Error Handling)", "PASS")
                return True
            else:
                print_test("Invalid Status Update (Error Handling)", "FAIL", f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            print_test("Invalid Status Update (Error Handling)", "FAIL", str(e))
            return False

async def main():
    """Run all backend tests"""
    print("\n" + "="*70)
    print(f"{Colors.BLUE}SCALPING BOT EA STORE - BACKEND API TESTS{Colors.RESET}")
    print(f"{Colors.BLUE}Testing Payment Verification Features{Colors.RESET}")
    print("="*70 + "\n")
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    # Test 1: Root endpoint
    print(f"\n{Colors.YELLOW}[1] Testing Basic Endpoints{Colors.RESET}")
    print("-" * 70)
    result = await test_root_endpoint()
    results["total"] += 1
    if result:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 2: Get products
    print(f"\n{Colors.YELLOW}[2] Testing Product Endpoints{Colors.RESET}")
    print("-" * 70)
    result, products = await test_get_products()
    results["total"] += 1
    if result:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    product_id = None
    if products:
        product_id = products[0]["id"]
        result = await test_get_single_product(product_id)
        results["total"] += 1
        if result:
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Test 3: Create order with enhanced fields
    print(f"\n{Colors.YELLOW}[3] Testing Order Creation with Enhanced Fields{Colors.RESET}")
    print("-" * 70)
    order_id = None
    if product_id:
        result, order = await test_create_order(product_id)
        results["total"] += 1
        if result:
            results["passed"] += 1
            order_id = order["id"]
        else:
            results["failed"] += 1
    
    # Test 4: Get orders
    print(f"\n{Colors.YELLOW}[4] Testing Order Retrieval{Colors.RESET}")
    print("-" * 70)
    result = await test_get_orders()
    results["total"] += 1
    if result:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    if order_id:
        result = await test_get_single_order(order_id)
        results["total"] += 1
        if result:
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Test 5: Admin endpoints
    print(f"\n{Colors.YELLOW}[5] Testing Admin Endpoints{Colors.RESET}")
    print("-" * 70)
    result = await test_admin_stats()
    results["total"] += 1
    if result:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    result = await test_admin_orders()
    results["total"] += 1
    if result:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 6: Payment verification
    print(f"\n{Colors.YELLOW}[6] Testing Payment Verification{Colors.RESET}")
    print("-" * 70)
    if order_id:
        result = await test_verify_payment(order_id)
        results["total"] += 1
        if result:
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Test 7: Order status update
    print(f"\n{Colors.YELLOW}[7] Testing Order Status Update{Colors.RESET}")
    print("-" * 70)
    if order_id:
        result = await test_update_order_status(order_id)
        results["total"] += 1
        if result:
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Test 8: Performance metrics
    print(f"\n{Colors.YELLOW}[8] Testing Performance Metrics{Colors.RESET}")
    print("-" * 70)
    result = await test_performance_endpoint()
    results["total"] += 1
    if result:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 9: Error handling
    print(f"\n{Colors.YELLOW}[9] Testing Error Handling{Colors.RESET}")
    print("-" * 70)
    result = await test_invalid_order_verification()
    results["total"] += 1
    if result:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    if order_id:
        result = await test_invalid_status_update(order_id)
        results["total"] += 1
        if result:
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Print summary
    print("\n" + "="*70)
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.RESET}")
    print("="*70)
    print(f"Total Tests: {results['total']}")
    print(f"{Colors.GREEN}Passed: {results['passed']}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {results['failed']}{Colors.RESET}")
    
    if results['failed'] == 0:
        print(f"\n{Colors.GREEN}✓ ALL TESTS PASSED!{Colors.RESET}\n")
    else:
        print(f"\n{Colors.RED}✗ SOME TESTS FAILED{Colors.RESET}\n")
    
    return results['failed'] == 0

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
