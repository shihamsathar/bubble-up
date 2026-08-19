import React, { useState } from 'react';
import { 
  Terminal, Code2, Server, Database, Package, 
  Download, Copy, CheckCircle, ExternalLink, X, ShieldCheck 
} from 'lucide-react';

export const StandaloneDeliverablesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'PYTHON_BACKEND' | 'DATABASE' | 'REQUIREMENTS' | 'EXE_BUILD' | 'RENDER_DEPLOY'>('PYTHON_BACKEND');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pythonBackendCode = `"""
Bubble Up Trading - Laundry Equipment Service Management System
Backend API Server (FastAPI + SQLAlchemy + Pydantic)
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

# Database Setup (SQLite for dev / PostgreSQL for prod)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./laundry_service.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="TECHNICIAN") # ADMIN or TECHNICIAN
    is_active = Column(Boolean, default=True)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=False)
    mobile = Column(String(30), nullable=False)
    telephone = Column(String(30), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=False)
    area = Column(String(100), nullable=False)
    city = Column(String(50), default="Dubai")
    customer_type = Column(String(50), default="HOTEL") # HOTEL, HOSPITAL, COMMERCIAL_LAUNDRY
    tax_vat_number = Column(String(50), nullable=True)
    outstanding_balance = Column(Float, default=0.0)

class Machine(Base):
    __tablename__ = "machines"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    category = Column(String(80), nullable=False) # WASHER_EXTRACTOR, DRYER, IRONER, BOILER
    brand = Column(String(80), nullable=False)
    model = Column(String(80), nullable=False)
    serial_number = Column(String(100), unique=True, nullable=False)
    capacity_kg = Column(Float, default=20.0)
    power_supply = Column(String(100), nullable=True)
    installation_date = Column(String(20), nullable=True)
    warranty_status = Column(String(30), default="ACTIVE")
    warranty_end_date = Column(String(20), nullable=True)
    machine_location = Column(String(100), nullable=True)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(30), unique=True, nullable=False)
    make = Column(String(50), default="Toyota")
    model = Column(String(50), default="HiAce Van")
    year = Column(Integer, default=2023)
    current_mileage = Column(Integer, default=0)
    status = Column(String(30), default="AVAILABLE") # AVAILABLE, ASSIGNED, UNDER_MAINTENANCE
    assigned_technician_id = Column(Integer, nullable=True)

class JobCard(Base):
    __tablename__ = "job_cards"
    id = Column(Integer, primary_key=True, index=True)
    job_card_number = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    machine_id = Column(Integer, ForeignKey("machines.id"))
    technician_id = Column(Integer, ForeignKey("users.id"))
    service_type = Column(String(50), default="BREAKDOWN_REPAIR")
    priority = Column(String(20), default="MEDIUM")
    status = Column(String(30), default="NEW")
    problem_description = Column(Text, nullable=False)
    initial_diagnosis = Column(Text, nullable=True)
    work_performed = Column(Text, nullable=True)
    labor_charges = Column(Float, default=0.0)
    parts_total = Column(Float, default=0.0)
    vat_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    outstanding_balance = Column(Float, default=0.0)
    payment_status = Column(String(20), default="UNPAID")
    invoice_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# --- FastAPI App ---
app = FastAPI(
    title="Bubble Up Trading Service Management API",
    version="2.6.0",
    description="Commercial Laundry Equipment Service, Vehicle & Job Card System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {"status": "operational", "system": "Bubble Up Trading Laundry Service API v2.6"}

@app.get("/api/jobcards")
def get_job_cards(db: Session = Depends(get_db)):
    return db.query(JobCard).all()

@app.get("/api/customers")
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@app.get("/api/vehicles")
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

  const databaseSqlCode = `-- Bubble Up Trading - Laundry Equipment Service Management System
-- Relational Database DDL Schema (PostgreSQL / SQLite compatible)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TECHNICIAN')),
    mobile VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    mobile VARCHAR(30) NOT NULL,
    telephone VARCHAR(30),
    email VARCHAR(100),
    address TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    city VARCHAR(50) DEFAULT 'Dubai',
    country VARCHAR(50) DEFAULT 'United Arab Emirates',
    tax_vat_number VARCHAR(50),
    customer_type VARCHAR(50) DEFAULT 'HOTEL',
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    category VARCHAR(80) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    capacity_kg NUMERIC(6, 2) DEFAULT 20.00,
    power_supply VARCHAR(100),
    installation_date DATE,
    warranty_start_date DATE,
    warranty_end_date DATE,
    warranty_status VARCHAR(30) DEFAULT 'ACTIVE',
    machine_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(30) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    current_mileage INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    assigned_technician_id INT REFERENCES users(id),
    insurance_expiry DATE,
    registration_expiry DATE,
    service_due_date DATE
);

CREATE TABLE IF NOT EXISTS spare_parts (
    id SERIAL PRIMARY KEY,
    part_number VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    compatible_brands VARCHAR(200),
    cost_price NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    storage_location VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS job_cards (
    id SERIAL PRIMARY KEY,
    job_card_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL REFERENCES customers(id),
    machine_id INT NOT NULL REFERENCES machines(id),
    technician_id INT NOT NULL REFERENCES users(id),
    service_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(30) DEFAULT 'NEW',
    scheduled_date DATE,
    problem_description TEXT NOT NULL,
    initial_diagnosis TEXT,
    work_performed TEXT,
    labor_charges NUMERIC(10, 2) DEFAULT 0.00,
    travel_charges NUMERIC(10, 2) DEFAULT 0.00,
    parts_total NUMERIC(10, 2) DEFAULT 0.00,
    vat_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    outstanding_balance NUMERIC(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'UNPAID',
    invoice_number VARCHAR(50),
    customer_signature TEXT,
    technician_signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

  const requirementsTxt = `fastapi==0.110.0
uvicorn==0.28.0
sqlalchemy==2.0.28
pydantic==2.6.4
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
reportlab==4.1.0
pyinstaller==6.5.0
webview==0.1.5
`;

  const exeBuildScript = `@echo off
echo ====================================================================
echo Building Standalone Executable: Laundry_Service_Management.exe
echo ====================================================================

REM Step 1: Install Python Build Dependencies
pip install -r requirements.txt
pip install pyinstaller

REM Step 2: Build Desktop Executable with embedded Chromium Webview
pyinstaller --noconfirm --onedir --windowed ^
    --name "Laundry_Service_Management" ^
    --add-data "dist;dist" ^
    --add-data "laundry_service.db;." ^
    --icon "assets/icon.ico" ^
    standalone_app.py

echo.
echo ====================================================================
echo Build Complete! Binary created at: dist/Laundry_Service_Management.exe
echo ====================================================================
pause
`;

  const renderYamlCode = `services:
  - type: web
    name: bubble-up-trading-service
    env: python
    buildCommand: "pip install -r requirements.txt && npm run build"
    startCommand: "uvicorn server:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.8
      - key: DATABASE_URL
        fromDatabase:
          name: bubbleup-db
          property: connectionString

databases:
  - name: bubbleup-db
    databaseName: bubble_up_service
    user: bubbleup_admin
    plan: starter
`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-700 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Standalone Deliverables & Python Codebase</h2>
              <p className="text-xs text-slate-400">FastAPI backend, SQLAlchemy ORM, PostgreSQL schema, PyInstaller EXE packaging & Render deploy</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 text-xs font-semibold text-slate-400 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PYTHON_BACKEND')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'PYTHON_BACKEND' ? 'border-sky-500 text-sky-400 font-bold bg-slate-800/50' : 'border-transparent hover:text-white'}`}
          >
            <Server className="w-4 h-4" />
            Python FastAPI Server (server.py)
          </button>
          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'DATABASE' ? 'border-sky-500 text-sky-400 font-bold bg-slate-800/50' : 'border-transparent hover:text-white'}`}
          >
            <Database className="w-4 h-4" />
            SQL Schema (schema.sql)
          </button>
          <button
            onClick={() => setActiveTab('REQUIREMENTS')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'REQUIREMENTS' ? 'border-sky-500 text-sky-400 font-bold bg-slate-800/50' : 'border-transparent hover:text-white'}`}
          >
            <Code2 className="w-4 h-4" />
            requirements.txt
          </button>
          <button
            onClick={() => setActiveTab('EXE_BUILD')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'EXE_BUILD' ? 'border-sky-500 text-sky-400 font-bold bg-slate-800/50' : 'border-transparent hover:text-white'}`}
          >
            <Terminal className="w-4 h-4" />
            build_exe.bat (PyInstaller)
          </button>
          <button
            onClick={() => setActiveTab('RENDER_DEPLOY')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'RENDER_DEPLOY' ? 'border-sky-500 text-sky-400 font-bold bg-slate-800/50' : 'border-transparent hover:text-white'}`}
          >
            <ExternalLink className="w-4 h-4" />
            render.yaml (Cloud Deployment)
          </button>
        </div>

        {/* Tab Code Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          
          {activeTab === 'PYTHON_BACKEND' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans text-xs">Full Python FastAPI Backend with SQLAlchemy ORM Models and REST Endpoints:</span>
                <button
                  onClick={() => copyToClipboard(pythonBackendCode, 'py')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedKey === 'py' ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'py' ? 'Copied to Clipboard' : 'Copy Python Code'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sky-300 overflow-x-auto text-[11px] leading-relaxed">
                {pythonBackendCode}
              </pre>
            </div>
          )}

          {activeTab === 'DATABASE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans text-xs">Complete Relational DDL for SQLite & PostgreSQL (Customers, Machines, Vehicles, Job Cards, Inventory):</span>
                <button
                  onClick={() => copyToClipboard(databaseSqlCode, 'sql')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedKey === 'sql' ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'sql' ? 'Copied' : 'Copy SQL Schema'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
                {databaseSqlCode}
              </pre>
            </div>
          )}

          {activeTab === 'REQUIREMENTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans text-xs">Production Python dependencies:</span>
                <button
                  onClick={() => copyToClipboard(requirementsTxt, 'req')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedKey === 'req' ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'req' ? 'Copied' : 'Copy requirements.txt'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-amber-300 overflow-x-auto text-xs leading-relaxed">
                {requirementsTxt}
              </pre>
            </div>
          )}

          {activeTab === 'EXE_BUILD' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans text-xs">Windows batch script to compile standalone `Laundry_Service_Management.exe`:</span>
                <button
                  onClick={() => copyToClipboard(exeBuildScript, 'exe')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedKey === 'exe' ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'exe' ? 'Copied' : 'Copy Batch Script'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-purple-300 overflow-x-auto text-xs leading-relaxed">
                {exeBuildScript}
              </pre>
            </div>
          )}

          {activeTab === 'RENDER_DEPLOY' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans text-xs">One-click Render.com Blueprint configuration (Web Service + Managed PostgreSQL):</span>
                <button
                  onClick={() => copyToClipboard(renderYamlCode, 'yaml')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedKey === 'yaml' ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'yaml' ? 'Copied' : 'Copy render.yaml'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sky-300 overflow-x-auto text-xs leading-relaxed">
                {renderYamlCode}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-sans">
          <span>Enterprise Laundry Equipment Service Architecture v2.6</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
