import { ChatContext, ChatQueryResult, ExistingRoute, PlaceInfo, postChatQuery, RouteRecommendation } from '@/api/chat.service';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

// ===== Constants =====
const CHAT_HISTORY_KEY = '@chat_history';
const CHAT_CONTEXT_KEY = '@chat_context';

// ===== Types =====
type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
  routeRecommendation?: RouteRecommendation;
  existingRoutes?: ExistingRoute[];
  places?: PlaceInfo[];
  suggestions?: string[];
};

// ===== Helper: Chat Manager Logic (as a custom hook) =====

const useChatManager = () => {
  const contextRef = useRef<ChatContext | null>(null);
  const isInitialized = useRef(false);

  const saveContext = async (context: ChatContext | null) => {
    try {
      await AsyncStorage.setItem(CHAT_CONTEXT_KEY, JSON.stringify(context));
    } catch (e) {
      console.error("Failed to save chat context.", e);
    }
  };

  const resetContext = () => {
    contextRef.current = null;
  };

  const sendMessage = async (query: string): Promise<ChatQueryResult> => {
    if (!contextRef.current?.sessionId) {
      contextRef.current = {
        ...contextRef.current,
        sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        conversationStartTime: Date.now(),
      };
    }

    const response = await postChatQuery({ query, context: contextRef.current });
    contextRef.current = response.result.context;
    await saveContext(contextRef.current);

    return response.result;
  };

  // Load context on init
  useEffect(() => {
    const loadContext = async () => {
      try {
        const savedContext = await AsyncStorage.getItem(CHAT_CONTEXT_KEY);
        if (savedContext) {
          contextRef.current = JSON.parse(savedContext);
        }
      } catch (e) {
        console.error("Failed to load chat context.", e);
      }
      isInitialized.current = true;
    };
    loadContext();
  }, []);

  return { sendMessage, isInitialized, resetContext };
};



const INITIAL_MESSAGE = (i18n: any): Message => ({
  id: '1',
  sender: 'ai',
  text: i18n.t('chat.welcome'),
  suggestions: [
    i18n.t('chat.suggestions.kpopRoute'),
    i18n.t('chat.suggestions.nearbyFood'),
  ],
});

// ===== Main Component =====

export default function AiGuideScreen() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(
    () => [INITIAL_MESSAGE(i18n)]
  );
  const { sendMessage, isInitialized, resetContext } = useChatManager();
  const flatListRef = useRef<FlatList>(null);
  const isFocused = useIsFocused();

  const { accessToken, ensureValidAccessToken } = useAuthSession();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 로그인 상태 확인
  useEffect(() => {
    if (isFocused) {
      setIsAuthLoading(true);
      ensureValidAccessToken().finally(() => setIsAuthLoading(false));
    }
  }, [isFocused, ensureValidAccessToken]);

  useEffect(() => {
    setMessages(prev => {
      if (
        prev.length === 1 &&
        prev[0].id === '1' &&
        prev[0].sender === 'ai'
      ) {
        const next = INITIAL_MESSAGE(i18n);
        return [{ ...prev[0], text: next.text, suggestions: next.suggestions }];
      }
      return prev;
    });
  }, [i18n.language]);

  // Load messages from storage on mount
  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
        if (saved) {
          setMessages(JSON.parse(saved));
        } else {
          setMessages([INITIAL_MESSAGE(i18n)]);
        }
      } catch {
        setMessages([INITIAL_MESSAGE(i18n)]);
      }
    })();
  }, [accessToken]); // 로그인 상태 확정 후 불러오기

  // Save messages to storage on change
  useEffect(() => {
    if (!accessToken) return;
    const saveMessages = async () => {
      try {
        if (messages.length === 0 || messages[messages.length - 1].isLoading) {
          return;
        }
        const messagesToSave = messages.filter(m => !m.isLoading);
        await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave));
      } catch (e) {
        console.error("Failed to save messages.", e);
      }
    };

    if (isInitialized.current) {
      saveMessages();
    }
  }, [messages, isInitialized, accessToken]);

  // Auto-scroll effect
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleNewChat = () => {
    Alert.alert(
      t('chat.resetTitle'),
      t('chat.resetBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
            await AsyncStorage.removeItem(CHAT_CONTEXT_KEY);
            resetContext();
            setMessages([INITIAL_MESSAGE(i18n)]);
          },
        },
      ]
    );
  };


  const handleSend = useCallback(async () => {
    if (input.trim() === '') return;

    const query = input;
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: query };
    const loadingMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: '', isLoading: true };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput('');

    try {
      const result = await sendMessage(query);

      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'ai',
        text: result.message,
        routeRecommendation: result.routeRecommendation,
        existingRoutes: result.existingRoutes,
        places: result.places,
      };

      setMessages((prev) => [...prev.slice(0, -1), aiResponse]); // Replace loading message
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'ai',
        text: t('chat.errorGeneric'),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    }
  }, [input, sendMessage]);

  const renderMessageItem = ({ item }: { item: Message }) => {
    if (item.sender === 'user') {
      return (
        <UserMessage>
          <LinearGradient colors={['#8569ff', '#53bdff']} start={[0, 1]} end={[1, 0]} style={styleSheet.userBubble}>
            <UserText>{item.text}</UserText>
          </LinearGradient>
        </UserMessage>
      );
    }

    // AI Message
    return (
      <AiMessage>
        <AvatarWrapper>
          <Avatar source={require('@/assets/images/ai-bot.png')} />
          <AvatarName>MEY</AvatarName>
        </AvatarWrapper>
        <MessageBubble>
          {item.isLoading ? (
            <ActivityIndicator color="#333" />
          ) : (
            <MessageText>{item.text}</MessageText>
          )}
        </MessageBubble>

        {item.suggestions && (
          <SuggestionBox>
            {item.suggestions.map((suggestion, index) => (
              <TagButton key={index} onPress={() => setInput(suggestion)}>
                <TagText>{suggestion}</TagText>
              </TagButton>
            ))}
          </SuggestionBox>
        )}

        {item.routeRecommendation && <RouteCard route={item.routeRecommendation} />}
        {item.existingRoutes && <ExistingRoutesList routes={item.existingRoutes} />}
        {item.places && <PlacesList places={item.places} />}

      </AiMessage>
    );
  };

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!accessToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#333', marginBottom: 20, fontFamily: 'Pretendard-Regular' }}>{t('chat.loginRequired')}</Text>
        <TouchableOpacity style={{ backgroundColor: '#279FFF', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 }} onPress={() => router.push('/account/login')}>
          <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Pretendard-SemiBold' }}>{t('auth.login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Container>
      <NewChatButton onPress={handleNewChat}>
        <Ionicons name="add-circle-outline" size={24} color="#333" />
        <NewChatButtonText>{t('chat.newChat')}</NewChatButtonText>
      </NewChatButton>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 30}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={{ padding: 16, paddingTop: 50 }} // 버튼과 겹치지 않도록 패딩 추가
        />

        <InputArea>
          <Input placeholder={t('chat.inputPlaceholder')} value={input} onChangeText={setInput} />
          <SendButton onPress={handleSend}>
            <Ionicons name="send" size={20} color="white" />
          </SendButton>
        </InputArea>
      </KeyboardAvoidingView>
    </Container>
  );
}

// ===== Card Components (Placeholders/Styled) =====

const RouteCard = ({ route }: { route: RouteRecommendation }) => {
  const { t } = useTranslation();
  return (
    <CardWrapper onPress={() => router.push(`/route/route-overview/${route.routeId}`)}>
      <CardTitle>{route.title}</CardTitle>
      <CardDescription>{route.description}</CardDescription>
      <CardMeta>{t('chat.meta.costAmount', { amount: route.estimatedCost.toLocaleString() })} · {t('chat.meta.durationMin', { mins: route.durationMinutes })}</CardMeta>
      <SeeMore>{t('chat.seeMore')}</SeeMore>
    </CardWrapper>
  );
};

const ExistingRoutesList = ({ routes }: { routes: ExistingRoute[] }) => {
  const { t } = useTranslation();
  return (
    <CardListContainer>
      {routes.map((route) => (
        <CardWrapper key={route.routeId} onPress={() => router.push(`/route/route-overview/${route.routeId}`)}>
          <CardTitle>{route.title}</CardTitle>
          <CardDescription>{route.description}</CardDescription>
          <CardMeta>{t('chat.meta.costAmount', { amount: route.estimatedCost.toLocaleString() })} · {t('chat.meta.durationMin', { mins: route.durationMinutes })}</CardMeta>
          <SeeMore>{t('chat.seeMore')}</SeeMore>
        </CardWrapper>
      ))}
    </CardListContainer>
  );
};

const PlacesList = ({ places }: { places: PlaceInfo[] }) => {
  const { t } = useTranslation();
  return (
    <CardListContainer>
      {places.map((place) => (
        <CardWrapper key={place.placeId} onPress={() => router.push(`/place/place-detail/${place.placeId}`)}>
          <CardTitle>{place.name}</CardTitle>
          <CardDescription>{place.description}</CardDescription>
          <CardMeta> {t('chat.meta.addressLabel', { addr: place.address })} · {t('chat.meta.costLabel', { cost: place.costInfo || t('common.unknown') })}</CardMeta>
          <SeeMore>{t('chat.seeMore')}</SeeMore>
        </CardWrapper>
      ))}
    </CardListContainer>
  );
};


// ===== Styles =====

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

const NewChatButton = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  right: 16px;
  z-index: 10;
  flex-direction: row;
  align-items: center;
  background-color: #f0f0f0;
  padding: 6px 12px;
  border-radius: 20px;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.15;
  shadow-radius: 3px;
`;

const NewChatButtonText = styled.Text`
  font-size: 14px;
  color: #333;
  margin-left: 6px;
  font-weight: 600;
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

const AvatarName = styled.Text`
  color: #9D9D9D;
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
  min-width: 50px;
  justify-content: center;
  align-items: center;
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
  margin-top: 8px;
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

const CardListContainer = styled.View`
  width: 85%;
  gap: 12px;
`;

const CardWrapper = styled(TouchableOpacity)`
  margin-top: 8px;
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  border-width: 1px;
  border-color: #eee;
  width: 100%;
`;

const CardTitle = styled.Text`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 6px;
`;

const CardDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const CardMeta = styled.Text`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
`;

const SeeMore = styled.Text`
  color: #2680eb;
  font-size: 13px;
  font-weight: bold;
  text-align: right;
`;

const InputArea = styled.View`
  flex-direction: row;
  padding: 10px 16px;
  border-top-width: 1px;
  border-color: #eee;
  background-color: #fff;
`;

const Input = styled.TextInput`
  flex: 1;
  padding: 10px 15px;
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