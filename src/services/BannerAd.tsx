import React, { useEffect, useState } from "react";
import { View } from "react-native";
import mobileAds, {
  BannerAd as GoogleBannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

export default function BannerAd() {
  const [isInitialized, setIsInitialized] = useState(false);

  // 테스트 모드/프로덕션 광고 단위 ID 설정
  const adUnitId = __DEV__
    ? TestIds.BANNER // "ca-app-pub-3940256099942544/6300978111" 과 동일
    : "ca-app-pub-5145202325745375/9440073957";

  useEffect(() => {
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        // 구글 광고 SDK 준비 상태 확인
        const status = adapterStatuses.find(
          (adapter) => adapter.name === "com.google.android.gms.ads.MobileAds",
        );

        if (status && status.state === 1) {
          console.log("✅ AdMob SDK 초기화 성공!");
          setIsInitialized(true);
        } else {
          console.log("⚠️ SDK 초기화 지연/실패 (재시도 필요):", status);
          // 네트워크/구글 플레이 서비스 지연 시 2초 후 재시도
          setTimeout(() => setIsInitialized(true), 2000);
        }
      })
      .catch((err) => {
        console.log("❌ SDK 초기화 에러:", err);
        // 에러가 나더라도 광고 요청 시도를 위해 처리
        setIsInitialized(true);
      });
  }, []);

  // SDK 초기화 완료 전까지는 렌더링을 유예하여 타임아웃/내부 에러 방지
  if (!isInitialized) return null;

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GoogleBannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => {
          console.log("✅ 광고 로드 성공");
        }}
        onAdFailedToLoad={(error) => {
          console.log("❌ 광고 로드 실패:", error);
        }}
      />
    </View>
  );
}
