// app/account/edit-profile.tsx
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Button, Pressable } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import styled from 'styled-components/native';

type Language = { label: string; value: string };

export default function EditProfileScreen() {
  const [username, setUsername] = useState('홍길동');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ko');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const languages: Language[] = [
    { label: '한국어', value: 'ko' },
    { label: '영어', value: 'en' },
    { label: '일본어', value: 'ja' },
    { label: '중국어', value: 'zh' },
  ];

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    console.log('변경된 이름:', username);
    console.log('선호 언어:', selectedLanguage);
    console.log('프로필 이미지 URI:', profileImage);

    // TODO: 서버로 업데이트 요청

    Alert.alert('프로필이 저장되었습니다!');
  };

  return (
    <Container>
      <Title>프로필 수정</Title>

      <ProfileImageContainer>
        <Pressable onPress={pickImage}>
          {profileImage ? (
            <ProfileImage source={{ uri: profileImage }} />
          ) : (
            <Placeholder>
              <PlaceholderText>이미지 선택</PlaceholderText>
            </Placeholder>
          )}
        </Pressable>
      </ProfileImageContainer>

      <Input
        placeholder="이름"
        value={username}
        onChangeText={setUsername}
      />

      <StyledDropdown
        placeholderStyle={{ color: 'gray' }}
        selectedTextStyle={{ color: 'black' }}
        data={languages}
        labelField="label"
        valueField="value"
        placeholder="선호 언어 선택"
        value={selectedLanguage}
        onChange={(item: Language) => {
          setSelectedLanguage(item.value);
        }}
      />

      <Button title="저장" onPress={handleSave} />
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Input = styled.TextInput`
  height: 40px;
  border: 1px solid gray;
  margin-bottom: 12px;
  padding: 0 8px;
  border-radius: 4px;
`;

const StyledDropdown = styled(Dropdown)`
  height: 40px;
  border: 1px solid gray;
  margin-bottom: 12px;
  padding: 0 8px;
  border-radius: 4px;
`;

const ProfileImageContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const Placeholder = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: #ddd;
  justify-content: center;
  align-items: center;
`;

const PlaceholderText = styled.Text`
  color: gray;
`;

