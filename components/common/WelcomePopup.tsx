import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

interface WelcomePopupProps {
  visible: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>위치 기반 서비스 이용 동의</Text>
          <Text style={styles.modalText}>
            더 나은 여행 경험을 위해 현재 위치 정보가 필요합니다. 위치 정보는 앱 사용 중에만 활용되며, 저장되지 않습니다.
          </Text>
          <Text style={styles.modalText}>
            동의하지 않으셔도 앱 이용은 가능하지만, 일부 기능(예: 주변 장소 추천, 경로 안내) 사용에 제약이 있을 수 있습니다.
          </Text>
          <Button title="확인" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
  },
});

export default WelcomePopup;