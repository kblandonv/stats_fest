import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
`;

const ProfileInfo = styled.div`
  color: white;
`;

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/user-profile');
                setProfile(response.data);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('No se pudo cargar la información del perfil.');
            }
        };

        fetchProfile();
    }, []);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        profile && (
            <ProfileContainer>
                <ProfileImage src={profile.images[0]?.url} alt="Profile" />
                <ProfileInfo>
                    <h2>{profile.display_name}</h2>
                    <p>{profile.email}</p>
                </ProfileInfo>
            </ProfileContainer>
        )
    );
};

export default UserProfile;
