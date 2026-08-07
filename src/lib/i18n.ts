import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Supported languages
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
  "nav.explore": t("Explore", "Explorer", "استكشف", "Explorar", "Обзор", "Entdecken", "探索", "探索", "탐색", "Ontdek"),
  "nav.dashboard": t("Dashboard", "Tableau de bord", "لوحة التحكم", "Panel", "Панель", "Dashboard", "仪表盘", "ダッシュボード", "대시보드", "Dashboard"),
  "nav.trackOrder": t("Track Order", "Suivre Commande", "تتبع الطلب", "Rastrear Pedido", "Отследить заказ", "Bestellung verfolgen", "追踪订单", "注文追跡", "주문 추적", "Bestelling volgen"),
  "nav.contact": t("Contact", "Contact", "اتصل", "Contacto", "Контакт", "Kontakt", "联系", "連絡先", "연락처", "Contact"),
  "nav.whyUs": t("Why Us", "Pourquoi Nous", "لماذا نحن", "Por Qué Nosotros", "Почему мы", "Warum wir", "为什么选我们", "私たちの理由", "우리를 선택하는 이유", "Waarom wij"),
  "nav.signIn": t("Sign In", "Connexion", "تسجيل الدخول", "Iniciar sesión", "Войти", "Anmelden", "登录", "サインイン", "로그인", "Inloggen"),
  "nav.signOut": t("Sign Out", "Déconnexion", "تسجيل الخروج", "Cerrar sesión", "Выйти", "Abmelden", "退出", "サインアウト", "로그아웃", "Uitloggen"),
  "nav.selfCare": t("Self-Care", "Soins Personnels", "العناية الذاتية", "Cuidado Personal", "Уход за собой", "Selbstpflege", "自我护理", "セルフケア", "셀프 케어", "Zelfzorg"),
  "nav.fragrances": t("Fragrances", "Parfums", "العطور", "Fragancias", "Ароматы", "Düfte", "香水", "フレグランス", "향수", "Geuren"),
  "nav.airDiffusers": t("Air Diffusers", "Diffuseurs", "معطرات الجو", "Difusores", "Диффузоры", "Diffusoren", "香薰机", "ディフューザー", "디퓨저", "Diffusers"),
  "nav.watches": t("Watches", "Montres", "الساعات", "Relojes", "Часы", "Uhren", "手表", "腕時計", "시계", "Horloges"),

  // hero
  "hero.title1": t("Elevate Your", "Élevez Votre", "ارتقِ بـ", "Eleva Tu", "Возвысьте свой", "Erhebe deinen", "提升您的", "あなたの", "당신의", "Verhef Uw"),
  "hero.titleAccent": t("LifeStyle", "Style de Vie", "أسلوب حياتك", "Estilo de Vida", "Стиль", "Lebensstil", "生活方式", "ライフスタイル", "라이프스타일", "Levensstijl"),
  "hero.subtitle": t(
    "Discover our curated collection of premium self-care products, exquisite fragrances, and luxury accessories.",
    "Découvrez notre collection sélectionnée de produits de soins personnels, parfums exquis et accessoires de luxe.",
    "اكتشف مجموعتنا المختارة من منتجات العناية الشخصية والعطور الفاخرة والإكسسوارات الراقية.",
    "Descubre nuestra colección seleccionada de productos de cuidado personal, fragancias exquisitas y accesorios de lujo.",
    "Откройте нашу коллекцию премиальных средств по уходу, изысканных ароматов и роскошных аксессуаров.",
    "Entdecken Sie unsere kuratierte Kollektion aus Premium-Pflegeprodukten, edlen Düften und Luxus-Accessoires.",
    "探索我们精选的高端个护产品、精致香水和奢华配饰系列。",
    "厳選された高級セルフケア製品、洗練されたフレグランス、ラグジュアリーアクセサリーをご覧ください。",
    "엄선된 프리미엄 셀프케어 제품, 고급 향수, 럭셔리 액세서리 컬렉션을 만나보세요.",
    "Ontdek onze zorgvuldig samengestelde collectie premium verzorgingsproducten, verfijnde geuren en luxe accessoires."
  ),
  "hero.exploreCollection": t("Explore Collections", "Explorer les Collections", "استكشف المجموعات", "Explorar Colecciones", "Смотреть коллекции", "Kollektionen entdecken", "探索系列", "コレクションを見る", "컬렉션 보기", "Ontdek Collecties"),
  "hero.whyChoose": t("Why Choose Us", "Pourquoi Nous Choisir", "لماذا تختارنا", "Por Qué Elegirnos", "Почему выбирают нас", "Warum uns wählen", "为何选择我们", "選ばれる理由", "우리를 선택하는 이유", "Waarom voor ons kiezen"),
  "hero.discountBadge": t("Up to 8% OFF on Online Payments", "Jusqu'à 8% de réduction sur les paiements en ligne", "خصم يصل إلى 8% على المدفوعات عبر الإنترنت", "Hasta 8% de descuento en pagos en línea", "До 8% скидки при онлайн-оплате", "Bis zu 8% Rabatt bei Online-Zahlung", "在线支付最高享8%折扣", "オンライン決済で最大8%オフ", "온라인 결제 시 최대 8% 할인", "Tot 8% korting op online betalingen"),
  "hero.featured": t("Featured Picks", "Sélection Vedette", "المختارات المميزة", "Selección Destacada", "Избранное", "Ausgewählte Highlights", "精选推荐", "おすすめピック", "추천 상품", "Uitgelicht"),

  // features
  "features.onlineDiscount": t("Up to 8% OFF Online", "Jusqu'à 8% en ligne", "خصم 8% أونلاين", "Hasta 8% en línea", "До 8% онлайн", "Bis zu 8% online", "在线最高8%折扣", "オンライン最大8%オフ", "온라인 최대 8% 할인", "Tot 8% online"),
  "features.cod": t("Cash on Delivery", "Paiement à la livraison", "الدفع عند الاستلام", "Pago contra entrega", "Оплата при доставке", "Zahlung bei Lieferung", "货到付款", "代金引換", "착불", "Betaling bij levering"),
  "features.secure": t("Secure Shopping", "Achats Sécurisés", "تسوق آمن", "Compra Segura", "Безопасные покупки", "Sicheres Einkaufen", "安全购物", "安全なお買い物", "안전한 쇼핑", "Veilig winkelen"),
  "features.premium": t("Premium Quality", "Qualité Premium", "جودة عالية", "Calidad Premium", "Премиум качество", "Premium-Qualität", "优质品质", "プレミアム品質", "프리미엄 품질", "Premium kwaliteit"),

  // sections
  "section.exploreCollection": t("Explore Collections", "Explorer les Collections", "استكشف المجموعات", "Explorar Colecciones", "Смотреть коллекции", "Kollektionen entdecken", "探索系列", "コレクションを見る", "컬렉션 보기", "Ontdek Collecties"),
  "section.exploreDesc": t("Discover our diverse range of premium products across all categories.", "Découvrez notre gamme diversifiée de produits premium dans toutes les catégories.", "اكتشف مجموعتنا المتنوعة من المنتجات الفاخرة عبر جميع الفئات.", "Descubre nuestra amplia gama de productos premium en todas las categorías.", "Откройте наш разнообразный ассортимент премиальных товаров.", "Entdecken Sie unser vielfältiges Sortiment an Premium-Produkten.", "探索所有类别的多元高端产品。", "全カテゴリの多彩なプレミアム商品を発見。", "모든 카테고리의 다양한 프리미엄 제품을 만나보세요.", "Ontdek ons diverse aanbod premium producten."),
  "section.shopByCategory": t("Shop by Category", "Achetez par Catégorie", "تسوق حسب الفئة", "Comprar por Categoría", "Покупки по категории", "Nach Kategorie einkaufen", "按类别购物", "カテゴリで探す", "카테고리별 쇼핑", "Winkel per categorie"),
  "section.newArrivals": t("New Arrivals", "Nouveautés", "الوافدون الجدد", "Novedades", "Новинки", "Neuheiten", "新品上市", "新着商品", "신상품", "Nieuw"),
  "section.newArrivalsDesc": t("Be the first to discover our latest additions.", "Soyez le premier à découvrir nos dernières nouveautés.", "كن أول من يكتشف أحدث إضافاتنا.", "Sé el primero en descubrir nuestras últimas incorporaciones.", "Первыми узнайте о новинках.", "Entdecken Sie unsere Neuheiten als Erste.", "率先探索我们的最新产品。", "最新アイテムをいち早くチェック。", "최신 상품을 가장 먼저 만나보세요.", "Ontdek als eerste onze nieuwste toevoegingen."),
  "section.readyElevate": t("Ready to Elevate Your Lifestyle?", "Prêt à Élever Votre Style de Vie?", "هل أنت مستعد للارتقاء بأسلوب حياتك؟", "¿Listo para elevar tu estilo de vida?", "Готовы возвысить свой стиль?", "Bereit, Ihren Lebensstil zu erhöhen?", "准备提升您的生活方式了吗？", "ライフスタイルを高める準備はできましたか？", "라이프스타일을 높일 준비가 되셨나요?", "Klaar om je levensstijl te verheffen?"),
  "section.readyDesc": t("Join thousands of satisfied customers who have discovered the art of refined living.", "Rejoignez des milliers de clients satisfaits.", "انضم إلى آلاف العملاء الراضين.", "Únete a miles de clientes satisfechos.", "Присоединяйтесь к тысячам довольных клиентов.", "Schließen Sie sich Tausenden zufriedener Kunden an.", "加入数千名满意客户。", "何千人もの満足したお客様に加わりましょう。", "수천 명의 만족한 고객들과 함께하세요.", "Sluit je aan bij duizenden tevreden klanten."),
  "section.startShopping": t("Start Shopping", "Commencer les Achats", "ابدأ التسوق", "Empezar a Comprar", "Начать покупки", "Jetzt einkaufen", "开始购物", "ショッピングを始める", "쇼핑 시작", "Begin met winkelen"),
  "section.contactUs": t("Contact Us", "Contactez-Nous", "اتصل بنا", "Contáctanos", "Свяжитесь", "Kontaktieren", "联系我们", "お問い合わせ", "문의하기", "Contact"),
  "section.shopNow": t("Shop Now", "Acheter", "تسوق الآن", "Comprar", "В магазин", "Jetzt kaufen", "立即购买", "今すぐ購入", "지금 쇼핑", "Nu winkelen"),

  // explore clusters
  "explore.cluster.luxury": t("Luxury & Lifestyle", "Luxe & Style de Vie", "الفخامة ونمط الحياة", "Lujo y Estilo", "Роскошь", "Luxus & Lifestyle", "奢华生活", "ラグジュアリー", "럭셔리 & 라이프스타일", "Luxe & Lifestyle"),
  "explore.cluster.tech": t("Tech & Gear", "Tech & Équipement", "التقنية والمعدات", "Tecnología", "Техника", "Tech & Ausrüstung", "科技装备", "テック", "테크 & 기어", "Tech & Gear"),
  "explore.cluster.wellness": t("Wellness & Beauty", "Bien-être & Beauté", "الصحة والجمال", "Bienestar", "Красота", "Wellness & Schönheit", "健康美容", "ウェルネス", "웰니스 & 뷰티", "Wellness & Beauty"),
  "explore.cluster.art": t("Art & Living", "Art & Vie", "الفن والمعيشة", "Arte y Vida", "Искусство", "Kunst & Wohnen", "艺术生活", "アート", "아트 & 리빙", "Kunst & Wonen"),
  "explore.cluster.home": t("Home & Living", "Maison & Vie", "المنزل والمعيشة", "Hogar", "Дом", "Zuhause & Wohnen", "家居", "ホーム", "홈 & 리빙", "Wonen"),
  "explore.cluster.fashion": t("Fashion & Accessories", "Mode & Accessoires", "الأزياء والإكسسوارات", "Moda", "Мода", "Mode & Accessoires", "时尚配饰", "ファッション", "패션 & 액세서리", "Mode & Accessoires"),

  // explore items
  "explore.item.fragranceVault": t("Fragrance Vault", "Coffre à Parfums", "خزينة العطور", "Bóveda de Fragancias", "Хранилище ароматов", "Duft-Tresor", "香水典藏", "フレグランス・ヴォルト", "향수 볼트", "Geurenkluis"),
  "explore.item.wellnessRituals": t("Wellness Rituals", "Rituels Bien-être", "طقوس العافية", "Rituales de Bienestar", "Ритуалы", "Wellness-Rituale", "养生仪式", "ウェルネス儀式", "웰니스 리추얼", "Wellness Rituelen"),
  "explore.item.giftSets": t("Executive Gift Sets", "Coffrets Cadeaux", "أطقم هدايا", "Sets de Regalo", "Подарочные наборы", "Geschenksets", "礼品套装", "ギフトセット", "선물 세트", "Cadeausets"),
  "explore.item.limitedDrops": t("Limited Drops", "Éditions Limitées", "إصدارات محدودة", "Ediciones Limitadas", "Лимитированные", "Limitierte Drops", "限量款", "限定版", "리미티드", "Limited Drops"),
  "explore.item.smartAccessories": t("Smart Accessories", "Accessoires Intelligents", "إكسسوارات ذكية", "Accesorios Smart", "Умные аксессуары", "Smart-Accessoires", "智能配件", "スマートアクセサリー", "스마트 액세서리", "Smart Accessoires"),
  "explore.item.horology": t("Horology & Time", "Horlogerie", "علم الساعات", "Relojería", "Хронометрия", "Uhrmacherei", "钟表", "時計術", "시계학", "Horlogerie"),
  "explore.item.homeElectronics": t("Home Electronics", "Électronique Maison", "إلكترونيات منزلية", "Electrónica del Hogar", "Электроника", "Heimelektronik", "家用电器", "家電", "가전제품", "Home Elektronica"),
  "explore.item.grooming": t("The Grooming Suite", "Suite Grooming", "جناح العناية", "Suite de Grooming", "Груминг", "Grooming Suite", "美容套装", "グルーミング", "그루밍", "Grooming Suite"),
  "explore.item.apothecary": t("Organic Apothecary", "Apothicaire Bio", "الصيدلية العضوية", "Botica Orgánica", "Аптека органика", "Bio-Apotheke", "有机药房", "オーガニック薬局", "유기농 약국", "Biologische Apotheek"),
  "explore.item.selfCare": t("Personalized Self-Care", "Soins Personnalisés", "عناية شخصية", "Autocuidado", "Персональный уход", "Personalisierte Pflege", "个性化护理", "パーソナルケア", "맞춤 셀프케어", "Persoonlijke Verzorging"),
  "explore.item.atmospheric": t("Atmospheric Living", "Ambiance Vivante", "أجواء المعيشة", "Ambiente", "Атмосфера", "Atmosphäre", "氛围生活", "アトモスフィア", "분위기", "Atmosferisch Wonen"),
  "explore.item.homeDecor": t("Home Decor", "Décoration", "ديكور المنزل", "Decoración", "Декор", "Wohnaccessoires", "家居装饰", "ホームデコ", "홈 데코", "Woondecoratie"),
  "explore.item.lighting": t("Lighting & Ambience", "Éclairage & Ambiance", "الإضاءة والأجواء", "Iluminación", "Освещение", "Beleuchtung", "灯光氛围", "照明", "조명 & 분위기", "Verlichting"),
  "explore.item.furniture": t("Housing Furniture", "Mobilier", "أثاث المنزل", "Mobiliario", "Мебель", "Möbel", "家居家具", "家具", "가구", "Meubilair"),
  "explore.item.kitchen": t("Kitchen Tools", "Ustensiles de Cuisine", "أدوات المطبخ", "Utensilios de Cocina", "Кухня", "Küchengeräte", "厨房用具", "キッチンツール", "주방 도구", "Keukengerei"),
  "explore.item.bedroom": t("Bedroom Essentials", "Essentiels Chambre", "أساسيات غرفة النوم", "Esenciales Dormitorio", "Спальня", "Schlafzimmer", "卧室必需品", "寝室用品", "침실 필수품", "Slaapkamer"),
  "explore.item.bath": t("Bath & Linen", "Bain & Linge", "الحمام والبياضات", "Baño y Lencería", "Ванная", "Bad & Wäsche", "浴室织物", "バス&リネン", "욕실 & 리넨", "Bad & Linnen"),
  "explore.item.bags": t("Bags & Leather", "Sacs & Cuir", "الحقائب والجلود", "Bolsos y Cuero", "Сумки", "Taschen & Leder", "包袋皮具", "バッグ&レザー", "가방 & 가죽", "Tassen & Leer"),
  "explore.item.jewelry": t("Jewelry", "Bijoux", "المجوهرات", "Joyería", "Ювелирные", "Schmuck", "珠宝", "ジュエリー", "주얼리", "Sieraden"),
  "explore.item.eyewear": t("Eyewear", "Lunettes", "النظارات", "Gafas", "Очки", "Brillen", "眼镜", "アイウェア", "안경", "Brillen"),

  // footer
  "footer.brandTagline": t("Elevate your lifestyle with our curated collection of premium self-care, fragrances, and luxury accessories.", "Élevez votre style de vie avec notre collection sélectionnée.", "ارتقِ بأسلوب حياتك مع مجموعتنا المختارة.", "Eleva tu estilo de vida con nuestra colección selecta.", "Возвысьте свой стиль с нашей коллекцией.", "Erheben Sie Ihren Lebensstil mit unserer Kollektion.", "用我们的精选系列提升您的生活方式。", "厳選コレクションでライフスタイルを高めよう。", "엄선된 컬렉션으로 라이프스타일을 높이세요.", "Verhef je levensstijl met onze collectie."),
  "footer.quickLinks": t("Quick Links", "Liens Rapides", "روابط سريعة", "Enlaces Rápidos", "Быстрые ссылки", "Schnellzugriff", "快速链接", "クイックリンク", "빠른 링크", "Snelle Links"),
  "footer.categories": t("Categories", "Catégories", "الفئات", "Categorías", "Категории", "Kategorien", "类别", "カテゴリ", "카테고리", "Categorieën"),
  "footer.getInTouch": t("Get in Touch", "Contactez-Nous", "تواصل معنا", "Contáctanos", "Свяжитесь с нами", "Kontakt", "联系我们", "お問い合わせ", "연락하기", "Neem contact op"),
  "footer.getInTouchDesc": t("Have questions? We'd love to hear from you.", "Des questions? Nous serions ravis de vous entendre.", "هل لديك أسئلة؟", "¿Preguntas? Nos encantaría escucharte.", "Есть вопросы?", "Fragen? Wir freuen uns.", "有疑问？我们乐意倾听。", "ご質問はお気軽に。", "질문 있으신가요?", "Vragen? We horen graag van je."),
  "footer.sendMessage": t("Send Us a Message", "Envoyez-Nous un Message", "أرسل لنا رسالة", "Envíanos un Mensaje", "Написать нам", "Nachricht senden", "发送消息", "メッセージを送る", "메시지 보내기", "Stuur een bericht"),
  "footer.terms": t("Terms of Service", "Conditions d'Utilisation", "شروط الخدمة", "Términos", "Условия", "AGB", "服务条款", "利用規約", "이용약관", "Voorwaarden"),
  "footer.privacy": t("Privacy Policy", "Politique de Confidentialité", "سياسة الخصوصية", "Privacidad", "Конфиденциальность", "Datenschutz", "隐私政策", "プライバシー", "개인정보", "Privacy"),
  "footer.rights": t("All rights reserved.", "Tous droits réservés.", "جميع الحقوق محفوظة.", "Todos los derechos reservados.", "Все права защищены.", "Alle Rechte vorbehalten.", "版权所有。", "無断複写・転載を禁じます。", "판권 소유.", "Alle rechten voorbehouden."),
  "footer.codMorocco": t("Cash on Delivery (Morocco)", "Paiement à la livraison (Maroc)", "الدفع عند الاستلام (المغرب)", "Contra entrega (Marruecos)", "Оплата при доставке (Марокко)", "Zahlung bei Lieferung (Marokko)", "货到付款 (摩洛哥)", "代引き（モロッコ）", "착불 (모로코)", "Onder rembours (Marokko)"),
  "footer.discoverExplore": t("Discover", "Découvrir", "اكتشف", "Descubrir", "Открыть", "Entdecken", "探索", "見つける", "발견", "Ontdekken"),

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
  "seller.unlockAI": t("Unlock AI features with Lamra Lux Pro", "Débloquez l'IA avec Lamra Lux Pro", "افتح ميزات الذكاء الاصطناعي مع Lamra Lux Pro", "Desbloquea funciones IA con Lamra Lux Pro", "Откройте ИИ через Lamra Lux Pro", "KI mit Lamra Lux Pro freischalten", "通过 Lamra Lux Pro 解锁 AI", "Lamra Lux Pro でAIを解放", "Lamra Lux Pro로 AI 잠금 해제", "Ontgrendel AI met Lamra Lux Pro"),
};

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
  // Morocco-first: French is the default language
  lng: localStorage.getItem("i18nextLng") || "fr",
  fallbackLng: "fr",
  supportedLngs: LANGUAGES.map((l) => l.code),
  load: "languageOnly",
  interpolation: { escapeValue: false },
  detection: { order: ["localStorage"], caches: ["localStorage"] },
});

const applyDir = (lng: string) => {
  const l = LANGUAGES.find((x) => x.code === lng);
  document.documentElement.dir = (l as any)?.rtl ? "rtl" : "ltr";
  document.documentElement.lang = lng;
};
applyDir(i18n.language);
i18n.on("languageChanged", applyDir);

export default i18n;
