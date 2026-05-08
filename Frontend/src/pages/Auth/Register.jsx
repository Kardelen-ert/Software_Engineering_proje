import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Link bileşenini ekledik
import './Register.css';

const Register = () => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password.length < 8) {
            setError('Şifreniz en az 8 karakter olmalıdır.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Girdiğiniz şifreler eşleşmiyor.');
            return;
        }
        setSuccess('Harika! Hesabınız başarıyla oluşturuldu.');
    };

    return (
        <div className="register-container">
            <div className="form-card">
                <div className="header-text">
                    <h2>Aramıza Katıl</h2>
                        <p>İç dünyana bir adım at.</p>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Kullanıcı Adı</label>
                        <input type="text" name="username" placeholder="Kullanıcı Adı" value={formData.username} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>E-posta</label>
                        <input type="email" name="email" placeholder="ornek@mail.com" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Şifre</label>
                        <input type="password" name="password" placeholder="En az 8 karakter" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Şifreyi Onayla</label>
                        <input type="password" name="confirmPassword" placeholder="Şifrenizi tekrar girin" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="submit-btn">Kayıt Ol</button>
                </form>

                {/* 2. Yönlendirme Linkini Buraya Ekledik */}
                <div className="login-redirect">
                     Zaten bir hesabın var mı? 
                    <Link to="/login">Giriş Yap</Link>
                </div>

            </div>
        </div>
    );
};

export default Register;