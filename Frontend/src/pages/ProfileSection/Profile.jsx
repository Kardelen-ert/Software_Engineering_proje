import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        bio: ''
    });

    
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/auth/me', {
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
                        email: data.email || '',
                        bio: data.bio || ''
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
    

    if (loading) return <div className="profile-container" style={{color: '#4a6741'}}>Yükleniyor...</div>;

    return (
        <div className="profile-container">
            <div className="daily-card">
                <div className="card-header">
                    <span className="badge">Profil Ayarları</span>
                    <h1>Kişisel bilgilerini ve ruh halini düzenleyelim.</h1>
                    <p>Bu alan artık sana özel çalışıyor. Bilgilerin güncel kaldığında takibini daha rahat yapabilirsin.</p>
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

                    <div className="input-box full-width">
                        <label>Hakkımda / Ruh Hali</label>
                        <textarea 
                            placeholder="Bugün neler oldu, nasıl hissediyorsun?"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        />
                    </div>

                    <div className="button-group">
                        <button className="save-btn" onClick={() => alert("Backend güncellemesi pasif.")}>
                            Değişiklikleri Kaydet
                        </button>
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