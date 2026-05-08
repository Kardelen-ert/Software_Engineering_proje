import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API_URL = 'http://127.0.0.1:8000';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState({
        username: '',
        email: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfileData({
                        username: data.username || '',
                        email: data.email || ''
                    });
                } else {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (err) {
                setError('Veriler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    if (loading) return <div className="profile-container loading-text">Yükleniyor...</div>;

    return (
        <div className="profile-container">
            <div className="daily-card">
                <div className="card-header">
                    <span className="badge">Profil Ayarları</span>
                    <h1>Kişisel bilgilerini kontrol et.</h1>
                    <p>Hesap bilgilerini buradan görebilirsin</p>
                </div>

                <div className="profile-content">
                    {error && <div className="alert error">{error}</div>}
                    
                    <div className="input-row">
                        <div className="input-box">
                            <label>Kullanıcı Adı</label>
                            <input type="text" value={profileData.username} disabled />
                        </div>
                        <div className="input-box">
                            <label>E-posta Adresi</label>
                            <input type="email" value={profileData.email} readOnly />
                        </div>
                    </div>

                    <div className="daily-prompt-card">
                        <p>Bugün nasıl hissettiğini henüz kaydetmedin mi?</p>
                        <button 
                            className="go-daily-btn" 
                            onClick={() => navigate('/daily')}
                        >
                            Bugünkü Kaydını Gir
                        </button>
                    </div>

                    <div className="button-group">
                        <button className="logout-btn" onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}>
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
