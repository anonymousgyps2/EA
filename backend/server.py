from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    features: List[str]
    platform: str  # MT4, MT5, or Both
    min_deposit: float
    profit_percentage: float
    win_rate: float
    total_trades: int
    available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    features: List[str]
    platform: str
    min_deposit: float = 50.0
    profit_percentage: float
    win_rate: float
    total_trades: int

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    customer_name: str
    customer_email: EmailStr
    amount: float
    payment_method: str
    transaction_hash: Optional[str] = None
    license_key: str
    status: str = "pending"  # pending, completed, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    product_id: str
    customer_name: str
    customer_email: EmailStr
    amount: float
    payment_method: str  # TRC20_USDT, BEP20_USDT, TRX, BTC, ETH, BNB
    transaction_hash: Optional[str] = None

class PerformanceMetric(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    total_profit: float
    monthly_return: float
    win_rate: float
    total_trades: int
    avg_trade_duration: str
    max_drawdown: float
    sharpe_ratio: float

# Routes
@api_router.get("/")
async def root():
    return {"message": "Scalping Bot EA Store API"}

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product['created_at'], str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_input: ProductCreate):
    product_dict = product_input.model_dump()
    product_obj = Product(**product_dict)
    
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.products.insert_one(doc)
    return product_obj

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order_input: OrderCreate):
    # Verify product exists
    product = await db.products.find_one({"id": order_input.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Generate license key
    license_key = f"EA-{secrets.token_urlsafe(16).upper()}"
    
    order_dict = order_input.model_dump()
    order_obj = Order(**order_dict, license_key=license_key, status="pending")
    
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orders.insert_one(doc)
    return order_obj

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    return order

# Performance Metrics
@api_router.get("/performance", response_model=PerformanceMetric)
async def get_performance():
    metric = await db.performance.find_one({}, {"_id": 0})
    if not metric:
        # Return default metrics if none exist
        return PerformanceMetric(
            total_profit=147250.50,
            monthly_return=18.5,
            win_rate=87.3,
            total_trades=2847,
            avg_trade_duration="3.2 min",
            max_drawdown=12.4,
            sharpe_ratio=2.8
        )
    return metric

@api_router.post("/performance", response_model=PerformanceMetric)
async def create_performance(metric: PerformanceMetric):
    doc = metric.model_dump()
    await db.performance.delete_many({})  # Keep only one performance record
    await db.performance.insert_one(doc)
    return metric

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Initialize default product on startup
@app.on_event("startup")
async def init_default_data():
    # Check if products exist
    existing = await db.products.find_one({})
    if not existing:
        # Low Risk EA
        low_risk_product = Product(
            name="Low Risk EA - Stable Growth",
            description="Conservative scalping strategy designed for traders who prioritize capital preservation. Uses strict risk management with maximum 1% risk per trade. Ideal for beginners and those building consistent profits over time.",
            price=90.00,
            features=[
                "Conservative risk management (1% per trade max)",
                "Strict stop-loss placement (10-15 pips)",
                "Lower trade frequency for quality over quantity",
                "Targets 5-8% monthly returns consistently",
                "Maximum drawdown limited to 8%",
                "Works best in ranging and low volatility markets",
                "Automated position sizing based on account balance",
                "Compatible with accounts from $50-$10,000",
                "Advanced trend filtering to avoid false signals",
                "Works with MT4 & MT5",
                "Lifetime updates & 24/7 support"
            ],
            platform="Both MT4 & MT5",
            min_deposit=50.0,
            profit_percentage=6.5,
            win_rate=89.2,
            total_trades=1847
        )
        
        # Moderate Risk EA
        moderate_risk_product = Product(
            name="Moderate Risk EA - Balanced Performance",
            description="Balanced approach combining safety with growth potential. Uses dynamic risk management adjusting to market conditions. Perfect for traders seeking steady profits with controlled risk exposure.",
            price=150.00,
            features=[
                "Balanced risk management (2% per trade max)",
                "Dynamic stop-loss adjustment (15-25 pips)",
                "Medium trade frequency for optimal opportunities",
                "Targets 12-18% monthly returns",
                "Maximum drawdown limited to 15%",
                "Adapts to trending and ranging markets",
                "Multi-timeframe analysis (M5, M15, H1)",
                "Suitable for accounts from $100-$50,000",
                "Advanced entry filtering with 3 confirmation signals",
                "Trailing stop feature to lock in profits",
                "Works with MT4 & MT5",
                "Priority support & exclusive community access"
            ],
            platform="Both MT4 & MT5",
            min_deposit=100.0,
            profit_percentage=15.2,
            win_rate=85.7,
            total_trades=3421
        )
        
        # High Risk EA
        high_risk_product = Product(
            name="High Risk High Profit EA - Maximum Returns",
            description="Aggressive scalping strategy for experienced traders seeking maximum profit potential. Uses advanced algorithms to capture rapid market movements with higher position sizing. Requires strong risk tolerance and proper capital allocation.",
            price=200.00,
            features=[
                "Aggressive risk management (3-5% per trade)",
                "Wide stop-loss for market breathing room (25-40 pips)",
                "High trade frequency to maximize opportunities",
                "Targets 25-40% monthly returns",
                "Maximum drawdown up to 25% (managed carefully)",
                "Optimized for high volatility and trending markets",
                "Multi-pair scalping across 6+ currency pairs",
                "Recommended for accounts $200+",
                "Lightning-fast execution with scalping optimization",
                "Martingale recovery mode (optional, can be disabled)",
                "Advanced news filter to avoid high-impact events",
                "Works with MT4 & MT5",
                "VIP support with personal account manager"
            ],
            platform="Both MT4 & MT5",
            min_deposit=200.0,
            profit_percentage=32.8,
            win_rate=82.4,
            total_trades=5234
        )
        
        for product in [low_risk_product, moderate_risk_product, high_risk_product]:
            doc = product.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.products.insert_one(doc)
        
        logger.info("Default products created")