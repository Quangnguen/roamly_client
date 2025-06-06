import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface ProfileInfoProps {
    profilePic: string;
    name: string;
    bio: string;
    postCount: number;
    followersCount: number;
    followingCount: number;
    onAvatarPress: () => void;
    onFollowersPress: () => void;
    onFollowingPress: () => void;
    onEditProfilePress: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
    profilePic,
    name,
    bio,
    postCount,
    followersCount,
    followingCount,
    onAvatarPress,
    onFollowersPress,
    onFollowingPress,
    onEditProfilePress,
}) => {
    return (
        <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
                <TouchableOpacity onPress={onAvatarPress}>
                    <Image source={{ uri: profilePic }} style={styles.profileImage} />
                </TouchableOpacity>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{postCount}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <TouchableOpacity style={styles.statItem} onPress={onFollowersPress}>
                        <Text style={styles.statNumber}>{followersCount}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem} onPress={onFollowingPress}>
                        <Text style={styles.statNumber}>{followingCount}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.bioContainer}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.bioText}>{bio}</Text>
            </View>

            <TouchableOpacity style={styles.editProfileButton} onPress={onEditProfilePress}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    profileSection: {
        padding: 15,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: 15,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        color: '#262626',
    },
    bioContainer: {
        marginBottom: 15,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    bioText: {
        fontSize: 14,
        color: '#262626',
    },
    editProfileButton: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 4,
        paddingVertical: 7,
        alignItems: 'center',
        marginBottom: 15,
    },
    editProfileText: {
        fontWeight: '600',
        fontSize: 14,
    },
});

export default ProfileInfo; 