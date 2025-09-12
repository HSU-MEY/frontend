import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>개인정보처리방침</Text>
        
        <Text style={styles.sectionTitle}>1. 수집하는 개인정보 항목</Text>
        <Text style={styles.paragraph}>
          우리는 회원 관리, 각종 서비스의 제공을 위해 아래와 같은 최소한의 개인정보를 필수항목으로 수집하고 있습니다.
        </Text>
        <View style={styles.listItem}>
          <Text style={styles.paragraph}>- 이메일 주소</Text>
          <Text style={styles.paragraph}>- 닉네임</Text>
        </View>

        <Text style={styles.sectionTitle}>2. 개인정보의 수집 및 이용 목적</Text>
        <Text style={styles.paragraph}>
          우리는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
        </Text>
        <View style={styles.listItem}>
          <Text style={styles.paragraph}>- 회원제 서비스 이용에 따른 개인 식별</Text>
          <Text style={styles.paragraph}>- 불량회원의 부정 이용 방지와 비인가 사용 방지</Text>
          <Text style={styles.paragraph}>- 가입 의사 확인, 불만처리 등 원활한 의사소통 경로의 확보</Text>
        </View>

        <Text style={styles.sectionTitle}>3. 개인정보의 보유 및 이용기간</Text>
        <Text style={styles.paragraph}>
          우리는 개인정보 수집 및 이용목적이 달성된 후에는 예외 없이 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 우리는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
        </Text>
        <View style={styles.listItem}>
          <Text style={styles.paragraph}>- 계약 또는 청약철회 등에 관한 기록 : 5년</Text>
          <Text style={styles.paragraph}>- 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</Text>
        </View>

        <Text style={styles.sectionTitle}>4. 개인정보의 파기절차 및 방법</Text>
        <Text style={styles.paragraph}>
          우리는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.
        </Text>
        <View style={styles.listItem}>
          <Text style={styles.paragraph}>- 파기절차: 회원님이 회원가입 등을 위해 입력하신 정보는 목적이 달성된 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다.</Text>
          <Text style={styles.paragraph}>- 파기방법: 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</Text>
        </View>

        <Text style={styles.sectionTitle}>5. 문의</Text>
        <Text style={styles.paragraph}>
          개인정보처리방침에 대한 문의는 kroute@example.com 으로 연락주시기 바랍니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  listItem: {
    marginLeft: 10,
  }
});

export default PrivacyPolicyScreen;
