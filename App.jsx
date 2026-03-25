import { SafeAreaProvider } from 'react-native-safe-area-context';
import DieuHuongChinh from './ma_nguon/dieu_huong/tuyen_duong';
import { ChuDeProvider } from './ma_nguon/tien_ich/chu_de_giao_dien';

export default function App() {
  return (
    <SafeAreaProvider>
      <ChuDeProvider>
        <DieuHuongChinh />
      </ChuDeProvider>
    </SafeAreaProvider>
  );
}