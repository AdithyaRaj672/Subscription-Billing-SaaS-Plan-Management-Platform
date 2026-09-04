# P17 — Subscription Billing & SaaS Plan Management Platform

A multi-tenant backend billing engine built with Node.js, Express.js, and MongoDB. The system manages subscription plan lifecycles, usage metering, periodic invoice generation, dunning payment retry workflows, and admin revenue reporting.

---

## 📌 Project Overview & Architecture

* **Domain:** SaaS / Billing
* **Tech Stack:** Node.js, Express.js, MongoDB (Mongoose ODM), JWT, Bcrypt.js
* **Architecture:** MVC (Model-View-Controller) with multi-tenant database isolation
* **Course:** CIA-3 Project Development | 5th Semester | Christ University

---

## 👥 4-Member Role & Ownership Split

| Team Member | Functional Modules Owned | Key Responsibilities |
| :--- | :--- | :--- |
| **Member 1** | Modules 1, 2, 3, 13 | Tenant Onboarding, JWT Authentication, User Roles, RBAC Middleware |
| **Member 2** | Modules 2, 4, 8 | SaaS Plan Management, Plan Upgrades/Downgrades, Grace Period Cancellations |
| **Member 3** | Modules 3, 5, 8 | Subscription Lifecycles, Feature Usage Metering, Add-on Tracking |
| **Member 4** | Modules 6, 7, 9, 10, 11, 12 | Invoicing Engine, Payments, Coupons, Dunning Workflows, Customer Dashboard, MRR Analytics |

---

## 🗄️ Database Schema & Collections

1. **`users`**: Auth credentials (`passwordHash`), roles (`tenant_admin`, `super_admin`, `end_user`), and `tenantId`.
2. **`tenants`**: Organization metadata and operational status (`active`, `suspended`, `cancelled`).
3. **`plans`**: Product pricing tiers, billing cycles (`monthly`, `yearly`), and embedded feature limits.
4. **`subscriptions`**: Tenant-to-Plan mappings with billing cycle boundaries (`currentPeriodStart`, `currentPeriodEnd`).
5. **`usagerecords`**: Consumption logs for add-ons (API calls, storage, seats).
6. **`invoices`**: Billing statements calculating base plan price + usage add-ons - coupon discounts.
7. **`payments`**: Payment records tracking transaction IDs and statuses (`pending`, `succeeded`, `failed`).
8. **`coupons`**: Discount codes (`PROMO20`) applied to billing statements.

---

## 🛠️ Installation & Local Setup

### 1. Prerequisites
* Node.js (v16+)
* MongoDB Server (Local instance or MongoDB Atlas Cluster)

### 2. Environment Configuration
Create a `.env` file in the root folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/saas_billing_p17
JWT_SECRET=your_super_secret_jwt_key_2026