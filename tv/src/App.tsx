import {WebView} from '@amazon-devices/webview';
import * as React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  useHideSplashScreenCallback,
  usePreventHideSplashScreen,
} from '@amazon-devices/react-native-kepler';
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigationEvent,
} from '@amazon-devices/webview/dist/types/WebViewTypes';

// VDA reverse maps the virtual device's localhost:4173 to the host running
// Weave's session server. Both TV roles are chosen in the web app itself.
const WEAVE_URL = 'http://localhost:4173/?tv=1';

export const App = () => {
  const [attempt, setAttempt] = React.useState(0);
  const [loadError, setLoadError] = React.useState(false);
  const [retryFocused, setRetryFocused] = React.useState(false);
  usePreventHideSplashScreen();
  const hideSplashScreen = useHideSplashScreenCallback();

  const retry = () => {
    setLoadError(false);
    setAttempt(value => value + 1);
  };

  if (loadError) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.eyebrow}>WEAVE / CONNESSIONE</Text>
        <Text style={styles.heading}>La sessione non risponde.</Text>
        <Text style={styles.body}>
          Avvia il server Weave sul computer e collega la porta 4173 al
          simulatore. Poi riprova.
        </Text>
        <Pressable
          accessibilityRole="button"
          hasTVPreferredFocus
          onPress={retry}
          onFocus={() => setRetryFocused(true)}
          onBlur={() => setRetryFocused(false)}
          style={[styles.retryButton, retryFocused && styles.focused]}>
          <Text style={styles.retryText}>Riprova</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={attempt}
        style={styles.webview}
        allowSystemKeyEvents
        domStorageEnabled
        hasTVPreferredFocus
        javaScriptEnabled
        source={{uri: WEAVE_URL}}
        onLoad={(_event: WebViewNavigationEvent) => hideSplashScreen()}
        onError={({nativeEvent}: WebViewErrorEvent) => {
          console.error(`[Weave WebView] ${nativeEvent.description}`);
          hideSplashScreen();
          setLoadError(true);
        }}
        onHttpError={({nativeEvent}: WebViewHttpErrorEvent) => {
          if (nativeEvent.isMainFrame && nativeEvent.statusCode >= 400) {
            console.error(`[Weave WebView] HTTP ${nativeEvent.statusCode}`);
            hideSplashScreen();
            setLoadError(true);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  webview: {flex: 1, backgroundColor: '#101411'},
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 120,
    backgroundColor: '#101411',
  },
  eyebrow: {color: '#ffc36b', fontSize: 18, letterSpacing: 4},
  heading: {color: '#eef2e9', fontSize: 58, marginTop: 24, marginBottom: 22},
  body: {color: '#a2afa5', fontSize: 25, lineHeight: 38, maxWidth: 1000},
  retryButton: {
    marginTop: 42,
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#ffc36b',
    borderRadius: 10,
  },
  focused: {backgroundColor: '#493b23'},
  retryText: {color: '#ffc36b', fontSize: 25},
});
