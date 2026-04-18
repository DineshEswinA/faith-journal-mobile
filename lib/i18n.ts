import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to Faith Journal",
      "homeFeed": "Home Feed",
      "explore": "Explore",
      "profile": "Profile",
      "settings": "Settings",
      "createPost": "Write an Entry",
      "signIn": "Sign In",
      "signUp": "Sign Up"
    }
  },
  es: {
    translation: {
      "welcome": "Bienvenido a Faith Journal",
      "homeFeed": "Inicio",
      "explore": "Explorar",
      "profile": "Perfil",
      "settings": "Ajustes",
      "createPost": "Escribir una Entrada",
      "signIn": "Iniciar Sesión",
      "signUp": "Regístrate"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
