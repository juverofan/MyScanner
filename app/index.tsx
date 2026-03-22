import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, { useState } from 'react';
import { Alert, Image, Linking, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  // 1. Hàm xin quyền Camera an toàn
  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Thông báo", "Bạn cần cấp quyền Camera để sử dụng.");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể kích hoạt yêu cầu cấp quyền.");
    }
  };

  // 2. Quét QR
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    if (data.startsWith('http')) {
      Alert.alert("Link", data, [
        { text: "Hủy", onPress: () => setScanned(false) }, 
        { text: "Mở", onPress: () => { Linking.openURL(data); setScanned(false); } }
      ]);
    } else {
      Alert.alert("Nội dung", data, [{ text: "OK", onPress: () => setScanned(false) }]);
    }
  };

  // 3. Quét Văn Bản
  const scanDocument = async () => {
    const { scannedImages } = await DocumentScanner.scanDocument({
      maxNumDocuments: 1,
      letUserAdjustCrop: true,
    });
    if (scannedImages && scannedImages.length > 0) {
      setScannedImage(scannedImages[0]);
    }
  };

  // 4. Lưu ảnh
  const saveImage = async () => {
    if (!scannedImage) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      try {
        await MediaLibrary.saveToLibraryAsync(scannedImage);
        Alert.alert("Thành công", "Đã lưu vào máy!");
      } catch (error) {
        Alert.alert("Lỗi", "Không thể lưu ảnh.");
      }
    } else {
      Alert.alert("Quyền", "App cần quyền lưu ảnh.");
    }
  };

  // Giao diện khi chưa cấp quyền
  if (!permission || !permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Image source={require('../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerText}>Scanner Tool</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>Vui lòng cấp quyền Camera để sử dụng ứng dụng</Text>
          <TouchableOpacity style={styles.requestBtn} onPress={handleRequestPermission}>
            <Text style={styles.btnText}>CẤP QUYỀN CAMERA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Giao diện chính
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerText}>Scanner Tool</Text>
      </View>

      <View style={styles.content}>
        {!scannedImage ? (
          <View style={{ flex: 1 }}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.scanBtn} onPress={scanDocument}>
                <Text style={styles.btnText}>📸 SCAN VĂN BẢN</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Image source={{ uri: scannedImage }} style={styles.previewImage} resizeMode="contain" />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2196F3' }]} onPress={saveImage}>
                <Text style={styles.btnText}>Lưu vào máy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f44336' }]} onPress={() => setScannedImage(null)}>
                <Text style={styles.btnText}>Chụp lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#b394ee',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
  },
  headerLogo: { width: 80, height: 80, marginBottom: 10 },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  content: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoText: { color: '#666', textAlign: 'center', marginBottom: 30, fontSize: 16 },
  requestBtn: { backgroundColor: '#2196F3', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  bottomBar: { position: 'absolute', bottom: 40, left: 40, right: 40 },
  scanBtn: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 30, alignItems: 'center' },
  buttonRow: { flexDirection: 'row', gap: 15, padding: 20, justifyContent: 'center' },
  actionBtn: { paddingVertical: 15, paddingHorizontal: 25, borderRadius: 12, minWidth: 120, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '90%', height: '70%', borderRadius: 15, backgroundColor: '#fff' },
});