import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const welcomeText = "Mood Tracker'a Hoş Geldiniz!";

    return (
        <div className="home-container">
            <div className="home-content">
                {/* Harf harf gelme efekti için text split işlemi */}
                <div className="animated-text">
                    {welcomeText.split("").map((char, index) => (
                        <span key={index} style={{ animationDelay: `${index * 0.08}s` }}>
                            {char === " " ? "\u00A0" : char}
                        </span>
                    ))}
                </div>
                
                <p className="home-subtitle">
                    Duygularını takip et, alışkanlıklarını yönet ve kendini keşfet.
                </p>

                <div className="home-buttons">
                    <button className="home-btn login" onClick={() => navigate('/login')}>
                        Giriş Yap
                    </button>
                    <button className="home-btn register" onClick={() => navigate('/register')}>
                        Kayıt Ol
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;