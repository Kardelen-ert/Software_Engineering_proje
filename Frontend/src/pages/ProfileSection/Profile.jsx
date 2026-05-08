import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        username: 'glsm',
        email: 'ornek@mail.com',
        bio: 'slm ben glsm buralara backendden gelmem lazım'
    });

    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSuccessMsg('Profil bilgilerin başarıyla güncellendi!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const words = name.split(' ');
        if (words.length > 1) return words[0][0] + words[1][0];
        return words[0][0];
    };

    return (
        <div className="profile-dashboard">
            
            {/* Sol Taraf - Yan Menü (Sidebar) */}
            <aside className="profile-sidebar">
                <div className="profile-avatar-large">
                    {getInitials(profileData.username)}
                </div>
                <h2>{profileData.username}</h2>
                <p className="bio-text">
                    {profileData.bio || "Henüz bir ruh hali belirtilmedi."}
                </p>
                <button className="btn-logout" onClick={handleLogout}>
                    Çıkış Yap
                </button>
            </aside>

            {/* Sağ Taraf - Ana İçerik */}
            <main className="profile-main">
                <div className="main-header">
                    <h1>Hesap Ayarları</h1>
                    <p>Kişisel bilgilerini ve ruh halini buradan güncelleyebilirsin.</p>
                </div>

                {successMsg && <div className="alert-msg">{successMsg}</div>}

                <div className="profile-form-wide">
                    <form onSubmit={handleSave}>
                        
                        <div className="form-row">
                            <div className="input-group">
                                <label>Kullanıcı Adı</label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={profileData.username} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>E-posta Adresi</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={profileData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '25px' }}>
                            <label>Şu Anki Ruh Halin / Biyografi</label>
                            <textarea 
                                name="bio" 
                                value={profileData.bio} 
                                onChange={handleChange} 
                                placeholder="Bugünlerde nasıl hissediyorsun?"
                            />
                        </div>

                        <button type="submit" className="btn-save">Değişiklikleri Kaydet</button>
                    </form>
                </div>
            </main>

        </div>
    );
};

export default Profile;