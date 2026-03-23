export const LANDING_PAGE_TEMPLATES = [
  {
    id: "physio",
    name: "פיזיותרפיה ושיקום",
    description: "עיצוב מקצועי ונקי, מתאים למרפאות פיזיותרפיה ושיקום אורתופדי.",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "מרפאת פיזיותרפיה מתקדמת",
      theme_color: "#0ea5e9", // blue-500
      hero_section: {
        title: "חזרו לשגרה ולתנועה מלאה",
        subtitle: "אבחון וטיפול מקצועי בכאב ופציעות ספורט על ידי צוות מומחים.",
        cta_text: "קבע תור לאבחון",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `
        <h2>למה לבחור בנו?</h2>
        <p>אנו משתמשים בשיטות הטיפול המתקדמות ביותר כדי להבטיח שיקום מהיר ויעיל.</p>
        <ul>
          <li>טיפול ידני ומניפולציות</li>
          <li>דיקור מערבי יבש</li>
          <li>תרגילים רפואיים מותאמים אישית</li>
          <li>שיקום לאחר ניתוח</li>
        </ul>
        <h3>ההתמחות שלנו</h3>
        <p>אנו מטפלים במגוון רחב של בעיות אורתופדיות, כאבי גב, צוואר, ברכיים וכתפיים.</p>
      `,
      gallery_images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516549655169-df83a092fc4b?auto=format&fit=crop&w=800&q=80"
      ]
    }
  },
  {
    id: "massage",
    name: "עיסוי ורפואה משלימה",
    description: "עיצוב רגוע ומרגיע, מתאים למטפלים במגע, ספא ורפואה משלימה.",
    thumbnail: "https://images.unsplash.com/photo-1600334011039-1e6fbb6c90c6?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "טיפולי מגע וגוף-נפש",
      theme_color: "#d946ef", // fuchsia-500
      hero_section: {
        title: "הזמן שלך להירגע ולהתחדש",
        subtitle: "טיפולי עיסוי רפואי ושוודי באווירה שלווה ומרגיעה לשחרור מתחים.",
        cta_text: "הזמן טיפול עכשיו",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `
        <h2>שקט לגוף ולנפש</h2>
        <p>בקליניקה שלנו תמצאו מגוון טיפולים שנועדו להפיג מתחים, לשחרר שרירים תפוסים ולהעניק תחושת שלווה.</p>
        <p>אנו משלבים טכניקות מהמזרח והמערב:</p>
        <ul>
          <li>עיסוי שוודי קלאסי</li>
          <li>עיסוי רקמות עמוק</li>
          <li>אבנים חמות</li>
          <li>רפלקסולוגיה</li>
        </ul>
      `,
      gallery_images: [
        "https://images.unsplash.com/photo-1519823551278-64ac927d4fe1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
      ]
    }
  },
  {
    id: "acupuncture",
    name: "רפואה סינית ודיקור",
    description: "עיצוב טבעי ומאוזן, מתאים למטפלים ברפואה סינית ודיקור.",
    thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "רפואה סינית מסורתית",
      theme_color: "#10b981", // emerald-500
      hero_section: {
        title: "איזון טבעי לגוף ולנפש",
        subtitle: "טיפול במגוון בעיות רפואיות באמצעות דיקור, צמחי מרפא ותזונה.",
        cta_text: "תיאום פגישת ייעוץ",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `
        <h2>כוח הריפוי של הטבע</h2>
        <p>הרפואה הסינית מציעה פתרון הוליסטי למגוון בעיות כגון כאב, בעיות עיכול, מתח וחרדה, ובעיות הורמונליות.</p>
        <p>אנו מתמחים ב:</p>
        <ul>
          <li>דיקור סיני (אקופונקטורה)</li>
          <li>כוסות רוח ומוקסה</li>
          <li>טווינא (פיזיותרפיה סינית)</li>
          <li>התאמת תזונה</li>
        </ul>
      `,
      gallery_images: [
        "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1591343395082-e214716b7499?auto=format&fit=crop&w=800&q=80"
      ]
    }
  },
  {
    id: "consulting",
    name: "ייעוץ וטיפול רגשי",
    description: "עיצוב סולידי ומרגיע, מתאים לפסיכולוגים, מטפלים רגשיים ומאמנים.",
    thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "מרחב בטוח לשינוי",
      theme_color: "#6366f1", // violet-500
      hero_section: {
        title: "להקשיב, להבין, לצמוח",
        subtitle: "ליווי אישי ומקצועי בתהליכי שינוי והתמודדות עם אתגרי החיים.",
        cta_text: "קבע שיחת היכרות",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `
        <h2>נעים להכיר</h2>
        <p>אני מזמין אתכם למרחב בטוח ומכיל, בו נוכל לעבוד יחד על המטרות שלכם.</p>
        <p>תחומי הטיפול:</p>
        <ul>
          <li>חרדה ודיכאון</li>
          <li>משברי חיים</li>
          <li>יחסים וזוגיות</li>
          <li>הגשמה עצמית וקריירה</li>
        </ul>
        <p>הטיפול משלב גישות דינמיות וקוגניטיביות-התנהגותיות (CBT) בהתאם לצורך.</p>
      `,
      gallery_images: [
        "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1554200876-56c2f25224fa?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
      ]
    }
  },
  {
    id: "nutrition",
    name: "תזונה ודיאטה",
    description: "עיצוב רענן וירוק, מתאים לדיאטנים, תזונאים ומאמני תזונה.",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "תזונה נכונה ואורח חיים בריא",
      theme_color: "#84cc16", // lime-500
      hero_section: {
        title: "לאכול נכון, להרגיש מצוין",
        subtitle: "ייעוץ תזונתי מותאם אישית להשגת משקל יעד, בריאות ואנרגיה.",
        cta_text: "התחל את השינוי",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>הדרך שלך לבריאות מתחילה בצלחת</h2><p>אני מאמין/ה שתזונה היא הבסיס לחיים בריאים ומאושרים. הגישה שלי מתמקדת בשינוי הרגלים ארוך טווח ולא בדיאטות בזק.</p><ul><li>בניית תפריט אישי</li><li>ליווי צמוד ותמיכה</li><li>תזונת ספורט</li><li>טיפול בבעיות עיכול</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "personaltraining",
    name: "אימון כושר אישי",
    description: "עיצוב אנרגטי ודינמי למאמני כושר וספורט.",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "אימון כושר אישי",
      theme_color: "#ef4444", // red-500
      hero_section: {
        title: "הגוף שתמיד רציתם",
        subtitle: "אימונים אישיים וקבוצתיים לחיטוב, חיזוק ושיפור הכושר הגופני.",
        cta_text: "קבע אימון ניסיון",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>למה להתאמן איתי?</h2><p>גישה מקצועית, יחס אישי ותוצאות מוכחות. אני אדחוף אתכם לקצה היכולת ואעזור לכם להשיג את המטרות שלכם.</p><ul><li>אימוני כוח וסיבולת</li><li>אימוני HIIT</li><li>ירידה במשקל</li><li>שיפור ביצועים</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517963879466-e9b5ce382d99?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "yoga",
    name: "סטודיו ליוגה",
    description: "עיצוב הרמוני ורוחני למורים ליוגה וסטודיו.",
    thumbnail: "https://images.unsplash.com/photo-1599447421405-0c17414ab77d?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "יוגה לגוף ולנשמה",
      theme_color: "#a855f7", // purple-500
      hero_section: {
        title: "נשימה, תנועה, חיבור",
        subtitle: "שיעורי יוגה לכל הרמות באווירה תומכת ומאפשרת.",
        cta_text: "הצטרפו לשיעור",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>היוגה כדרך חיים</h2><p>היוגה מאפשרת לנו להתחבר לעצמנו, לחזק את הגוף ולהרגיע את התודעה. השיעורים מתאימים למתחילים ומתקדמים כאחד.</p><ul><li>ויניאסה יוגה</li><li>האטה יוגה</li><li>יוגה נשית</li><li>מדיטציה ומיינדפולנס</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "pilates",
    name: "פילאטיס מכשירים/מזרן",
    description: "עיצוב מודרני ונקי למכוני פילאטיס.",
    thumbnail: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "פילאטיס לחיזוק וגמישות",
      theme_color: "#f472b6", // pink-400
      hero_section: {
        title: "לחזק את הליבה, להאריך את הגוף",
        subtitle: "שיעורי פילאטיס מכשירים ומזרן בקבוצות קטנות וביחס אישי.",
        cta_text: "תיאום שיעור ניסיון",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>היתרונות של הפילאטיס</h2><p>שיטת הפילאטיס עובדת על חיזוק שרירי הליבה, שיפור היציבה, הגמישות ושיווי המשקל. השיטה מתאימה לכל גיל ולכל רמת כושר.</p><ul><li>פילאטיס מכשירים</li><li>פילאטיס מזרן</li><li>שיקום פציעות</li><li>נשים בהריון ואחרי לידה</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1519311965067-36d3e5f1d6b9?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1522845015757-50bce044e5da?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "chiropractic",
    name: "כירופרקטיקה",
    description: "עיצוב רפואי ואמין לכירופרקטים.",
    thumbnail: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "מרכז לכירופרקטיקה ובריאות הגב",
      theme_color: "#0f766e", // teal-700
      hero_section: {
        title: "שחרור מכאב, חזרה לתפקוד",
        subtitle: "טיפול כירופרקטי מקצועי לבעיות עמוד שדרה, מפרקים וכאבי ראש.",
        cta_text: "קבע תור",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1579126038374-6064e9370f0f?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>טיפול בבעיה מהשורש</h2><p>כירופרקטיקה מתמקדת בקשר שבין מבנה עמוד השדרה לתפקוד מערכת העצבים. הטיפול עוזר לשחרר חסימות, להפחית כאב ולשפר את התפקוד הכללי.</p><ul><li>כאבי גב וצוואר</li><li>פריצת דיסק</li><li>כאבי ראש ומיגרנות</li><li>יציבה לקויה</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "osteopathy",
    name: "אוסטאופתיה",
    description: "עיצוב הוליסטי ומקצועי לאוסטאופתים.",
    thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "אוסטאופתיה - טיפול במגע עדין",
      theme_color: "#14b8a6", // teal-500
      hero_section: {
        title: "להחזיר לגוף את האיזון",
        subtitle: "אבחון וטיפול ידני במערכת השלד, השרירים והאיברים הפנימיים.",
        cta_text: "צור קשר",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1598300188485-4878b96463db?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>הגוף כיחידה אחת</h2><p>האוסטאופתיה רואה את הגוף כמכלול שלם. הטיפול עדין ובטוח, ומתאים לתינוקות, ילדים ומבוגרים.</p><ul><li>בעיות אורתופדיות</li><li>בעיות עיכול</li><li>כאבי ראש וסחרחורות</li><li>טיפול בתינוקות</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1598300188904-6287d5277c56?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1581056771107-24ca5f048d5d?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "speech_therapy",
    name: "קלינאות תקשורת",
    description: "עיצוב ידידותי ונעים, מתאים לקלינאי תקשורת.",
    thumbnail: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "קלינאות תקשורת לילדים ומבוגרים",
      theme_color: "#fbbf24", // amber-400
      hero_section: {
        title: "ללמוד לתקשר בביטחון",
        subtitle: "אבחון וטיפול בקשיי שפה, דיבור ותקשורת באווירה תומכת.",
        cta_text: "תיאום אבחון",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>כל אחד יכול להישמע</h2><p>אנו מספקים מענה מקצועי למגוון קשיים בתחום השפה והדיבור, החל מגיל הרך ועד לגיל השלישי.</p><ul><li>היגוי וגמגום</li><li>התפתחות שפה בילדים</li><li>שיקום הדיבור לאחר אירוע מוחי</li><li>צרידות ובעיות קול</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1587554801471-37976a256db0?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "occupational_therapy",
    name: "ריפוי בעיסוק",
    description: "עיצוב פונקציונלי ומזמין למרפאים בעיסוק.",
    thumbnail: "https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "ריפוי בעיסוק לקידום עצמאות",
      theme_color: "#f97316", // orange-500
      hero_section: {
        title: "הכלים להצלחה בחיי היום-יום",
        subtitle: "שיפור מיומנויות תפקוד, למידה ועצמאות לילדים ומבוגרים.",
        cta_text: "צור קשר",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1596496050844-461dc5b7263f?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>הדרך לעצמאות</h2><p>אנו עוזרים למטופלים לרכוש מיומנויות וכלים להתמודדות עם אתגרי היום-יום, בבית, בבית הספר ובעבודה.</p><ul><li>מוכנות לכיתה א'</li><li>קשיי קשב וריכוז</li><li>שיקום קוגניטיבי</li><li>התאמת סביבת מגורים</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "art_therapy",
    name: "טיפול באומנות",
    description: "עיצוב יצירתי וצבעוני למטפלים באומנות.",
    thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "טיפול באומנות - ליצור שינוי",
      theme_color: "#db2777", // pink-600
      hero_section: {
        title: "כשהמילים נגמרות, היצירה מתחילה",
        subtitle: "ביטוי רגשי, עיבוד חוויות וצמיחה אישית באמצעות כלים אומנותיים.",
        cta_text: "בואו ליצור",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1460661619275-d4c964a70279?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>הסטודיו הפתוח</h2><p>הטיפול באומנות מאפשר גישה לעולם הרגשי בדרך לא מילולית, חווייתית ויצירתית. מתאים לילדים, נוער ומבוגרים.</p><ul><li>ציור, פיסול וקולאז'</li><li>התמודדות עם טראומה</li><li>חיזוק הביטחון העצמי</li><li>ויסות רגשי</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1560421683-6856ea585c78?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1499892477393-f675b4a61db7?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "naturopathy",
    name: "נטורופתיה",
    description: "עיצוב טבעי ורענן לנטורופתים.",
    thumbnail: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "נטורופתיה ורפואה טבעית",
      theme_color: "#65a30d", // lime-600
      hero_section: {
        title: "בריאות טבעית בהתאמה אישית",
        subtitle: "שילוב של תזונה, צמחי מרפא ואורח חיים בריא לטיפול ומניעת מחלות.",
        cta_text: "פגישת ייעוץ",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>להקשיב לגוף</h2><p>הנטורופתיה מעודדת את כוחות הריפוי הטבעיים של הגוף. הטיפול מותאם אישית לכל מטופל וכולל המלצות תזונתיות ותוספי תזונה במידת הצורך.</p><ul><li>ניקוי רעלים (דיטוקס)</li><li>טיפול בבעיות עור</li><li>איזון הורמונלי</li><li>חיזוק המערכת החיסונית</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1615486171199-a787c880df90?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "homeopathy",
    name: "הומאופתיה",
    description: "עיצוב נקי ומינימליסטי להומאופתים.",
    thumbnail: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "הומאופתיה קלאסית",
      theme_color: "#0891b2", // cyan-600
      hero_section: {
        title: "ריפוי עדין ועמוק",
        subtitle: "טיפול הומאופתי הוליסטי לבעיות פיזיות ורגשיות.",
        cta_text: "צור קשר",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>דומה בדומה מרפא</h2><p>ההומאופתיה מטפלת באדם כמכלול, ולא רק בסימפטום הבודד. התרופה ההומאופתית מותאמת באופן אישי למאפיינים הייחודיים של כל מטופל.</p><ul><li>טיפול באלרגיות</li><li>בעיות קשב וריכוז</li><li>חיזוק המערכת החיסונית</li><li>טיפול בילדים ותינוקות</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1579165466741-7f35e4755652?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "reflexology",
    name: "רפלקסולוגיה",
    description: "עיצוב חם ומזמין למטפלי רפלקסולוגיה.",
    thumbnail: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "רפלקסולוגיה - המפה של הגוף",
      theme_color: "#d97706", // amber-600
      hero_section: {
        title: "איזון דרך כפות הרגליים",
        subtitle: "טיפול רפלקסולוגי להרגעה, הקלה בכאב ושיפור זרימת האנרגיה בגוף.",
        cta_text: "קבע תור",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>ללכת על בטוח</h2><p>כפות הרגליים משקפות את איברי הגוף השונים. באמצעות לחיצות ועיסוי בנקודות ספציפיות, ניתן להשפיע על מערכות הגוף ולהביא לריפוי.</p><ul><li>הפחתת מתח וחרדה</li><li>בעיות אורתופדיות</li><li>מערכת העיכול</li><li>בעיות שינה</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "shiatsu",
    name: "שיאצו",
    description: "עיצוב יפני/זן למטפלי שיאצו.",
    thumbnail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "שיאצו - מגע מרפא",
      theme_color: "#be185d", // pink-700
      hero_section: {
        title: "להחזיר את הזרימה לחיים",
        subtitle: "טיפול שיאצו מסורתי לשחרור חסימות אנרגטיות ואיזון הגוף והנפש.",
        cta_text: "הזמן טיפול",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1600334011039-1e6fbb6c90c6?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>מגע שמקשיב</h2><p>השיאצו מתבצע בלבוש מלא וכולל לחיצות על ערוצי האנרגיה (מרידיאנים), מתיחות והנעות. הטיפול מרגיע עמוקות ומסייע לגוף לרפא את עצמו.</p><ul><li>כאבי גב וצוואר</li><li>עייפות כרונית</li><li>בעיות רגשיות</li><li>שיפור היציבה</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1519823551278-64ac927d4fe1?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1596131397999-d588c7c90787?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "parent_counseling",
    name: "הדרכת הורים",
    description: "עיצוב משפחתי וחם למדריכי הורים.",
    thumbnail: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "הדרכת הורים ומשפחה",
      theme_color: "#4f46e5", // indigo-600
      hero_section: {
        title: "להיות ההורים שרציתם להיות",
        subtitle: "ליווי והדרכה להורים בהתמודדות עם אתגרי החינוך והגידול של הילדים.",
        cta_text: "תיאום פגישה",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>משפחה רגועה יותר</h2><p>ההורות מזמנת לנו אתגרים יומיומיים. בהדרכת הורים נקבל כלים מעשיים לשיפור התקשורת במשפחה, הצבת גבולות וחיזוק הסמכות ההורית.</p><ul><li>גמילה מחיתולים</li><li>קשיי שינה</li><li>מריבות בין אחים</li><li>גיל ההתבגרות</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "podiatry",
    name: "פדיקור רפואי/פודיאטריה",
    description: "עיצוב נקי ואסתטי לפודיאטרים.",
    thumbnail: "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "בריאות כף הרגל",
      theme_color: "#06b6d4", // cyan-500
      hero_section: {
        title: "צעדים בטוחים לבריאות",
        subtitle: "טיפול מקצועי בבעיות כף הרגל, ציפורן חודרנית ופטרת.",
        cta_text: "קבע תור",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>להקל על הכאב</h2><p>כפות הרגליים נושאות את כל משקל הגוף. טיפול נכון יכול למנוע כאבים ולשפר את איכות החיים.</p><ul><li>טיפול בציפורן חודרנית</li><li>יבלות ופטרת</li><li>מדרסים בהתאמה אישית</li><li>כף רגל סוכרתית</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1613243555988-441166d4d6fd?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1628143425675-48f211d0dd98?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "cosmetics",
    name: "קוסמטיקה ואסתטיקה",
    description: "עיצוב יוקרתי ומטופח לקוסמטיקאיות.",
    thumbnail: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "קליניקה לאסתטיקה מתקדמת",
      theme_color: "#f43f5e", // rose-500
      hero_section: {
        title: "יופי זוהר ובריא",
        subtitle: "טיפולי פנים וגוף מתקדמים בטכנולוגיות חדשניות ובחומרים איכותיים.",
        cta_text: "תיאום טיפול",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>להרגיש נפלא בעור שלך</h2><p>אנו מציעים מגוון טיפולי יופי לשיפור מרקם העור, הצערה וטיפוח.</p><ul><li>טיפולי אנטי-אייג'ינג</li><li>טיפול באקנה</li><li>הסרת שיער בלייזר</li><li>מניקור ופדיקור רפואי</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "hypnotherapy",
    name: "היפנוזה ודמיון מודרך",
    description: "עיצוב מסתורי ועמוק למטפלים בתת-מודע.",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "כוחו של התת-מודע",
      theme_color: "#7c3aed", // violet-600
      hero_section: {
        title: "לשנות מבפנים החוצה",
        subtitle: "טיפול באמצעות היפנוזה ודמיון מודרך לשחרור הרגלים, פחדים וחסמים.",
        cta_text: "גלה עוד",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>גישה ישירה למקור</h2><p>התת-מודע מנהל חלק ניכר מחיינו. באמצעות היפנוזה, ניתן לגשת לדפוסים עמוקים ולבצע שינוי אמיתי ומהיר.</p><ul><li>גמילה מעישון</li><li>ירידה במשקל</li><li>חרדת מבחנים וביצוע</li><li>חיזוק הביטחון העצמי</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1518531933037-9a847af20f50?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "animal_therapy",
    name: "טיפול באמצעות בעלי חיים",
    description: "עיצוב שמח וטבעי למטפלים עם בעלי חיים.",
    thumbnail: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "קשר מרפא עם בעלי חיים",
      theme_color: "#ea580c", // orange-600
      hero_section: {
        title: "אהבה ללא תנאים",
        subtitle: "טיפול רגשי ושיקומי בעזרת כלבים, סוסים וחיות אחרות לילדים ומבוגרים.",
        cta_text: "בואו להכיר",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1555685812-4b943f3e9942?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>חברים לדרך</h2><p>הקשר עם בעלי חיים מאפשר פתיחות, רוך וקבלה. הטיפול מסייע בפיתוח אמפתיה, אחריות ותקשורת.</p><ul><li>טיפול בילדים על הרצף האוטיסטי</li><li>התמודדות עם חרדות</li><li>רכיבה טיפולית</li><li>פינת ליטוף טיפולית</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80"]
    }
  },
  {
    id: "mindfulness",
    name: "מיינדפולנס ומדיטציה",
    description: "עיצוב שלו ומינימליסטי למנחי מדיטציה.",
    thumbnail: "https://images.unsplash.com/photo-1508672019048-805c27630a20?auto=format&fit=crop&w=500&q=60",
    data: {
      title: "להיות כאן ועכשיו",
      theme_color: "#57534e", // stone-600
      hero_section: {
        title: "שלווה בתוך הרעש",
        subtitle: "קורסים וסדנאות מיינדפולנס להפחתת לחצים, שיפור הריכוז וחיים מודעים.",
        cta_text: "הירשם לסדנה",
        cta_link: "#contact",
        image_url: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=1200&q=80"
      },
      content_section: `<h2>כוחה של תשומת הלב</h2><p>תרגול מיינדפולנס מלמד אותנו להיות נוכחים ברגע הזה, ללא שיפוטיות. זהו כלי רב עוצמה לשיפור איכות החיים.</p><ul><li>קורס MBSR להפחתת מתחים</li><li>מדיטציה יומית</li><li>ריטריטים</li><li>מיינדפולנס בעבודה</li></ul>`,
      gallery_images: ["https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1602192509153-03e6d66ea720?auto=format&fit=crop&w=800&q=80"]
    }
  }
];