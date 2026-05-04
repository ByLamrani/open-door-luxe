import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Supported languages (English, French, Arabic, Spanish, Russian, German,
// Chinese, Japanese, Korean, Dutch). "Netherland/Dutch" merged into one (nl).
export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦", rtl: true },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
];

const t = (en: string, fr: string, ar: string, es: string, ru: string, de: string, zh: string, ja: string, ko: string, nl: string) =>
  ({ en, fr, ar, es, ru, de, zh, ja, ko, nl });

const dict: Record<string, Record<string, string>> = {
  // navigation
  "nav.home": t("Home", "Accueil", "الرئيسية", "Inicio", "Главная", "Startseite", "首页", "ホーム", "홈", "Home"),
  "nav.dashboard": t("Dashboard", "Tableau de bord", "لوحة التحكم", "Panel", "Панель", "Dashboard", "仪表盘", "ダッシュボード", "대시보드", "Dashboard"),
  "nav.trackOrder": t("Track Order", "Suivre Commande", "تتبع الطلب", "Rastrear Pedido", "Отследить заказ", "Bestellung verfolgen", "追踪订单", "注文追跡", "주문 추적", "Bestelling volgen"),
  "nav.contact": t("Contact", "Contact", "اتصل", "Contacto", "Контакт", "Kontakt", "联系", "連絡先", "연락처", "Contact"),
  "nav.signIn": t("Sign In", "Connexion", "تسجيل الدخول", "Iniciar sesión", "Войти", "Anmelden", "登录", "サインイン", "로그인", "Inloggen"),
  "nav.signOut": t("Sign Out", "Déconnexion", "تسجيل الخروج", "Cerrar sesión", "Выйти", "Abmelden", "退出", "サインアウト", "로그아웃", "Uitloggen"),
  // profile
  "profile.title": t("My Profile", "Mon Profil", "ملفي", "Mi Perfil", "Мой профиль", "Mein Profil", "我的个人资料", "マイプロフィール", "내 프로필", "Mijn Profiel"),
  "profile.account": t("Account", "Compte", "الحساب", "Cuenta", "Аккаунт", "Konto", "账户", "アカウント", "계정", "Account"),
  "profile.wallet": t("E-Wallet", "Portefeuille", "المحفظة", "Billetera", "Кошелёк", "Wallet", "钱包", "ウォレット", "지갑", "Wallet"),
  "profile.purchases": t("Purchases", "Achats", "المشتريات", "Compras", "Покупки", "Käufe", "购买", "購入", "구매", "Aankopen"),
  "profile.favorites": t("Favorites", "Favoris", "المفضلة", "Favoritos", "Избранное", "Favoriten", "收藏", "お気に入り", "즐겨찾기", "Favorieten"),
  "profile.verifyNow": t("Verify Now", "Vérifier", "تحقق الآن", "Verificar", "Подтвердить", "Verifizieren", "立即验证", "今すぐ確認", "지금 인증", "Verifiëren"),
  "profile.becomeSeller": t("Become a Seller", "Devenir Vendeur", "كن بائعاً", "Ser Vendedor", "Стать продавцом", "Verkäufer werden", "成为卖家", "セラーになる", "판매자 되기", "Word verkoper"),
  "profile.upgradePlan": t("Upgrade Plan", "Améliorer le Plan", "ترقية الخطة", "Mejorar Plan", "Улучшить план", "Plan upgraden", "升级计划", "プラン更新", "플랜 업그레이드", "Upgrade abonnement"),
  // common
  "common.save": t("Save", "Enregistrer", "حفظ", "Guardar", "Сохранить", "Speichern", "保存", "保存", "저장", "Opslaan"),
  "common.edit": t("Edit", "Modifier", "تعديل", "Editar", "Изменить", "Bearbeiten", "编辑", "編集", "수정", "Bewerken"),
  "common.cancel": t("Cancel", "Annuler", "إلغاء", "Cancelar", "Отмена", "Abbrechen", "取消", "キャンセル", "취소", "Annuleren"),
  // seller
  "seller.listNewItem": t("List New Item", "Lister Article", "إدراج منتج", "Listar Artículo", "Добавить товар", "Artikel einstellen", "上架商品", "商品出品", "상품 등록", "Item plaatsen"),
  "seller.addCollection": t("Add New Collection", "Nouvelle Collection", "إضافة مجموعة", "Nueva Colección", "Новая коллекция", "Sammlung hinzufügen", "新增系列", "コレクション追加", "컬렉션 추가", "Collectie toevoegen"),
  "seller.aiInsight": t("AI Insight", "Analyse IA", "تحليل الذكاء", "Insight IA", "ИИ-инсайт", "KI-Einblick", "AI洞察", "AIインサイト", "AI 인사이트", "AI Inzicht"),
  "seller.unlockAI": t("Unlock AI features with Vanta Connect Pro", "Débloquez l'IA avec Vanta Connect Pro", "افتح ميزات الذكاء الاصطناعي مع Vanta Connect Pro", "Desbloquea funciones IA con Vanta Connect Pro", "Откройте ИИ через Vanta Connect Pro", "KI mit Vanta Connect Pro freischalten", "通过 Vanta Connect Pro 解锁 AI", "Vanta Connect Pro でAIを解放", "Vanta Connect Pro로 AI 잠금 해제", "Ontgrendel AI met Vanta Connect Pro"),
};

// build i18next resources
const resources: Record<string, { translation: Record<string, string> }> = {};
LANGUAGES.forEach((l) => {
  resources[l.code] = { translation: {} };
});
Object.entries(dict).forEach(([key, langs]) => {
  Object.entries(langs).forEach(([lang, val]) => {
    resources[lang].translation[key] = val;
  });
});

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
});

// RTL handling
const applyDir = (lng: string) => {
  const l = LANGUAGES.find((x) => x.code === lng);
  document.documentElement.dir = (l as any)?.rtl ? "rtl" : "ltr";
  document.documentElement.lang = lng;
};
applyDir(i18n.language);
i18n.on("languageChanged", applyDir);

export default i18n;
