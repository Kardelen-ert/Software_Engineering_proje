import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Register.css';

const Register = () => {
    const navigate = useNavigate(); // Yönlendirici tanımlandı

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        // Şifre kontrolü
        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler uyuşmuyor.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Başarıyla kayıt oldunuz! Giriş sayfasına yönlendiriliyorsunuz...');
                
                // 2 saniye sonra Login sayfasına yönlendir
                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            } else {
                setError(data.detail || 'Kayıt sırasında bir hata oluştu.');
            }
            
        } catch (err) {
            setError('Sunucuya ulaşılamıyor. FastAPI açık mı?');
        }
    };

    return (
        <div className="register-container">
            <div className="form-card">
                <div className="header-text">
                    <h2>Kayıt Ol</h2>
                    <p>Aramıza katıl ve gününü planla.</p>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Kullanıcı Adı</label>
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Kullanıcı adınızı belirleyin" 
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>E-posta</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="E-posta adresinizi girin" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Şifre</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Güçlü bir şifre seçin" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Şifre Onayla</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            placeholder="Şifrenizi tekrar girin" 
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <button type="submit" className="submit-btn">Kayıt Ol</button>
                </form>

                <div className="login-redirect">
                    Zaten bir hesabın var mı? 
                    <Link to="/login">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;