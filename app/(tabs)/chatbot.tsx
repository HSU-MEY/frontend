// app/(tabs)/chatbot.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import styled from 'styled-components/native';

export default function AiGuideScreen() {
  const [input, setInput] = useState('');

  const messages = [
    { id: '1', sender: 'ai', text: '안녕하세요, 저는 당신의 AI 가이드 MEY입니다! 무엇을 도와드릴까요?', suggestion: ["K-POP 루트 추천해줘", "주변 맛집 추천해줘"] },
    { id: '2', sender: 'user', text: 'K-POP 루트 추천해줘' },
    { id: '3', sender: 'ai', text: '물론이죠, K-POP 루트를 추천해드릴게요' },
  ];

  return (
    <Container>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.sender === 'ai' ? (
            <AiMessage>
              <AvatarWrapper>
                <Avatar source={{ uri: 'https://placehold.co/30x30' }} />
                MEY
              </AvatarWrapper>
              <MessageBubble>
                <MessageText>{item.text}</MessageText>
              </MessageBubble>
              <SuggestionBox>
                {item.suggestion?.map((suggestion, index) => (
                  <TagButton key={index} onPress={() => setInput(suggestion)}>
                    <TagText>{suggestion}</TagText>
                  </TagButton>
                ))}
              </SuggestionBox>
            </AiMessage>
          ) : (
            <UserMessage>
              <LinearGradient
                colors={['#8569ff', '#53bdff']}
                start={[0, 1]} end={[1, 0]}
                style={styleSheet.userBubble}
              >
                <UserText>{item.text}</UserText>
              </LinearGradient>
            </UserMessage>
          )
        }
        ListFooterComponent={
          <CardWrapper>
            <ImageGrid>
              <Preview source={{ uri: 'https://placehold.co/100x60' }} />
              <Preview source={{ uri: 'https://placehold.co/100x60' }} />
              <Preview source={{ uri: 'https://placehold.co/100x60' }} />
              <Preview source={{ uri: 'https://placehold.co/100x60' }} />
            </ImageGrid>
            <CardTitle>K-POP 루트: M/V 촬영 장소 투어</CardTitle>
            <SeeMore>자세히 보기 →</SeeMore>
          </CardWrapper>
        }
        contentContainerStyle={{ padding: 16 }}
      />

      <InputArea>
        <Input
          placeholder="MEY에게 물어보세요"
          value={input}
          onChangeText={setInput}
        />
        <SendButton>
          <Ionicons name="send" size={20} color="white" />
        </SendButton>
      </InputArea>
    </Container>
  );
}

const styleSheet = StyleSheet.create({
  userBubble: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    maxWidth: '80%',
  },
});


const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;


const AiMessage = styled.View`
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  align-items: flex-start;
`;

const AvatarWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const Avatar = styled.Image`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  margin-right: 8px;
`;

const MessageBubble = styled.View`
  background-color: #faf8ff;
  padding: 10px 20px;
  border-radius: 0 12px 12px 12px;
  max-width: 80%;
`;

const MessageText = styled.Text`
  color: #333;
`;

const UserMessage = styled.View`
  align-items: flex-end;
  margin-bottom: 12px;
`;

const UserText = styled.Text`
  color: white;
`;

const SuggestionBox = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const TagButton = styled.TouchableOpacity`
  background-color: #e5f1ff;
  padding: 8px 12px;
  border-radius: 20px;
`;

const TagText = styled.Text`
  color: #2680eb;
  font-size: 14px;
`;

const CardWrapper = styled.View`
  margin-top: 16px;
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
`;

const ImageGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Preview = styled.Image`
  width: 48%;
  height: 80px;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const CardTitle = styled.Text`
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 4px;
`;

const SeeMore = styled.Text`
  color: #2680eb;
  font-size: 13px;
`;

const InputArea = styled.View`
  flex-direction: row;
  padding: 10px 16px;
  border-top-width: 1px;
  border-color: #eee;
`;

const Input = styled.TextInput`
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  background-color: #f2f2f2;
`;

const SendButton = styled.TouchableOpacity`
  background-color: #2680eb;
  padding: 10px;
  margin-left: 8px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
`;

