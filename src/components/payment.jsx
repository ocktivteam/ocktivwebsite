import React from "react";
import "../style/payment.css";
import { useNavigate } from "react-router-dom";

const Payment = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-page">
            {/* NAVBAR */}
            <nav className="ocktiv-navbar">
                <div className="navbar-left">
                <a href="https://ocktiv.com/">
                <img src="/img/WhiteLogo.png" alt="Ocktiv Logo" className="navbar-logo" />
                    </a>
                </div>
                <ul className="navbar-links desktop-nav">
                    <li><a href="/all-courses">Courses</a></li>
                    <li><a href="https://ocktiv.com/#About" target="_blank">About</a></li>
                    <li><a href="https://bucolic-profiterole-262b56.netlify.app/" target="_blank">Services</a></li>
                </ul>
                <div className="navbar-login-wrap desktop-nav">
                    <a href="/login" className="navbar-login-btn">Login</a>
                </div>
            </nav>

            {/* PAYMENT CONTENT */}
            <div className="payment-container">
                <div className="checkout-left">
                    <h2 className="checkout-title">Checkout</h2>
                    <div className="form-group">
                        <label>
                            Full Legal Name <br />
                            <span className="label-subtext">(as it should appear on the certificate)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your full legal name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Country</label>
                        <input
                            type="text"
                            placeholder="Enter your country"
                        />
                    </div>
                </div>

                <div className="checkout-right">
                    <h3 className="order-summary-title">Order Details</h3>
                    <div className="order-card">
                        <img src="/img/ocktivLogo.png" alt="Course thumbnail" className="order-thumbnail" />
                        <div className="order-info">
                            <p className="course-title">Lean Six Sigma Yellow Belt</p>
                            <p className="course-price">$0.00</p>
                        </div>
                    </div>
                    <div className="coupon-section">
                        <input type="text" placeholder="Apply Coupon Code" />
                    </div>
                    <div className="price-summary">
                        <p>Subtotal: <span>$0.00</span></p>
                        <p>Discount: <span>$0.00</span></p>
                        <p>Total: <span>$0.00</span></p>
                    </div>
                    <button
  className="enroll-btn"
  onClick={() => window.open("/signup", "_blank")}
>
  Enroll
</button>

                </div>
            </div>
        </div>
    );
};

export default Payment;