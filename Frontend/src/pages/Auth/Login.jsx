import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Register.css'; 

const API_URL = 'http://127.0.0.1:8000';

const Login = () => {
    const navigate = useNavigate(); // Yönlendiriciyi tanımlıyoruz

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.username || !formData.password) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        try {
            
            const formDataToSend = new URLSearchParams();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('password', formData.password);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formDataToSend 
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Giriş başarılı! ');
                
                if (data.access_token) {
                    localStorage.setItem('token', data.access_token);
                }

                // 2 saniye sonra otomatik olarak profil sayfasına fırlatıyoruz
                setTimeout(() => {
                    navigate('/daily');
                }, 2000);
                
            } else {
                setError(data.detail || 'Kullanıcı adı veya şifre hatalı.');
            }
            
        } catch (err) {
            setError('Sunucuya ulaşılamıyor.');
        }
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
                            placeholder="Örn: Kullanıcı adınızı giriniz" 
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label>Şifre</label>
                            <Link to="/forgot-password" alt="Şifremi Unuttum" className="forgot-password-link">Şifremi Unuttum</Link>
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
