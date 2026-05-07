import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css'; 

const Login = () => {
    // email yerine username state'i tutuyoruz
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Kontrol mekanizmasını da username'e göre güncelledik
        if (!formData.username || !formData.password) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
    };

    return (
        <div className="register-container">
            <div className="form-card">
                <div className="header-text">
                    <h2>Hoş Geldin</h2>
                    <p>Kaldığın yerden devam et.</p>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Kullanıcı Adı</label>
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Kullanıcı Adı" 
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        {/* Şifre ve Şifremi Unuttum yan yana */}
                        <div className="label-row">
                            <label>Şifre</label>
                            <Link to="/forgot-password" className="forgot-password-link">Şifremi Unuttum</Link>
                        </div>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Şifrenizi girin" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <button type="submit" className="submit-btn">Giriş Yap</button>
                </form>

                <div className="login-redirect">
                    Henüz bir hesabın yok mu? 
                    <Link to="/register">Kayıt Ol</Link>
                </div>

            </div>
        </div>
    );
};

export default Login;