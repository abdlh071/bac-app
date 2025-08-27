// src/components/bac/quiz/french.ts

import { Question, shuffleArray } from './types';

// دالة مساعدة لإنشاء أسئلة مفردات فريدة لكل مستوى (نصوص تاريخية فرنسية)
const generateFrenchHistoryTextQuestions = (levelNum: number): Question[] => {
  const terms = [
    { word: 'Histoire', ar: 'التاريخ' }, { word: 'Civilisation', ar: 'الحضارة' }, { word: 'Empire', ar: 'إمبراطورية' },
    { word: 'Guerre', ar: 'حرب' }, { word: 'Paix', ar: 'سلام' }, { word: 'Révolution', ar: 'ثورة' },
    { word: 'Roi', ar: 'ملك' }, { word: 'Reine', ar: 'ملكة' }, { word: 'Bataille', ar: 'معركة' },
    { word: 'Victoire', ar: 'انتصار' }, { word: 'Défaite', ar: 'هزيمة' }, { word: 'Conquête', ar: 'فتح' },
    { word: 'Monument', ar: 'نصب تذكاري' }, { word: 'Patrimoine', ar: 'تراث' }, { word: 'Musée', ar: 'متحف' },
    { word: 'Archéologie', ar: 'علم الآثار' }, { word: 'Chronologie', ar: 'علم التاريخ' }, { word: 'Époque', ar: 'عصر' },
    { word: 'Siècle', ar: 'قرن' }, { word: 'Dynastie', ar: 'سلالة حاكمة' }, { word: 'République', ar: 'جمهورية' },
    { word: 'Démocratie', ar: 'ديمقراطية' }, { word: 'Constitution', ar: 'دستور' }, { word: 'Parlement', ar: 'برلمان' },
    { word: 'Ministère', ar: 'وزارة' }, { word: 'Ambassade', ar: 'سفارة' }, { word: 'Traité', ar: 'معاهدة' },
    { word: 'Alliance', ar: 'تحالف' }, { word: 'Colonisation', ar: 'استعمار' }, { word: 'Indépendance', ar: 'استقلال' },
    { word: 'Résistance', ar: 'مقاومة' }, { word: 'Libération', ar: 'تحرير' }, { word: 'Génocide', ar: 'إبادة جماعية' },
    { word: 'Réfugié', ar: 'لاجئ' }, { word: 'Immigration', ar: 'هجرة' }, { word: 'Frontière', ar: 'حدود' },
    { word: 'Territoire', ar: 'إقليم' }, { word: 'Souveraineté', ar: 'سيادة' }, { word: 'Diplomatie', ar: 'دبلوماسية' },
    { word: 'Négociation', ar: 'مفاوضات' }, { word: 'Traité de paix', ar: 'معاهدة سلام' }, { word: 'Armistice', ar: 'هدنة' },
    { word: 'Cessez-le-feu', ar: 'وقف إطلاق النار' }, { word: 'Conflit', ar: 'صراع' }, { word: 'Crise', ar: 'أزمة' },
    { word: 'Conquête', ar: 'غزو' }, { word: 'Occupation', ar: 'احتلال' }, { word: 'Annexion', ar: 'ضم' },
    { word: 'Gouvernement', ar: 'حكومة' }, { word: 'État', ar: 'دولة' }, { word: 'Nation', ar: 'أمة' },
    { word: 'Citoyen', ar: 'مواطن' }, { word: 'Droit', ar: 'حق' }, { word: 'Devoir', ar: 'واجب' },
    { word: 'Liberté', ar: 'حرية' }, { word: 'Égalité', ar: 'مساواة' }, { word: 'Fraternité', ar: 'أخوة' },
    { word: 'Justice sociale', ar: 'العدالة الاجتماعية' }, { word: 'Droits de l\'homme', ar: 'حقوق الإنسان' }, { word: 'Déclaration', ar: 'إعلان' },
    { word: 'Convention', ar: 'اتفاقية' }, { word: 'Protocole', ar: 'بروتوكول' }, { word: 'Charte', ar: 'ميثاق' },
    { word: 'Constitution', ar: 'دستور' }, { word: 'Loi', ar: 'قانون' }, { word: 'Décret', ar: 'مرسوم' },
    { word: 'Ordonnance', ar: 'أمر' }, { word: 'Traité international', ar: 'معاهدة دولية' }, { word: 'Organisation internationale', ar: 'منظمة دولية' },
    { word: 'Nations Unies', ar: 'الأمم المتحدة' }, { word: 'Union européenne', ar: 'الاتحاد الأوروبي' }, { word: 'Conseil de sécurité', ar: 'مجلس الأمن' },
    { word: 'Assemblée générale', ar: 'الجمعية العامة' }, { word: 'Cour internationale de justice', ar: 'محكمة العدل الدولية' }, { word: 'Crimes de guerre', ar: 'جرائم حرب' },
    { word: 'Crimes contre l\'humanité', ar: 'جرائم ضد الإنسانية' }, { word: 'Génocide', ar: 'إبادة جماعية' }, { word: 'Tribunal pénal international', ar: 'المحكمة الجنائية الدولية' },
    { word: 'Justice transitionnelle', ar: 'العدالة الانتقالية' }, { word: 'Réconciliation', ar: 'المصالحة' }, { word: 'Amnistie', ar: 'عفو' },
    { word: 'Réparations', ar: 'تعويضات' }, { word: 'Vérité et réconciliation', ar: 'الحقيقة والمصالحة' }, { word: 'Démocratisation', ar: 'التحول الديمقراطي' },
    { word: 'Transition démocratique', ar: 'الانتقال الديمقراطي' }, { word: 'Régime politique', ar: 'نظام سياسي' }, { word: 'Monarchie', ar: 'ملكية' },
    { word: 'République', ar: 'جمهورية' }, { word: 'Dictature', ar: 'ديكتاتورية' }, { word: 'Totalitarisme', ar: 'شمولية' },
    { word: 'Autoritarisme', ar: 'استبداد' }, { word: 'Fascisme', ar: 'فاشية' }, { word: 'Nazisme', ar: 'نازية' },
    { word: 'Communisme', ar: 'شيوعية' }, { word: 'Socialisme', ar: 'اشتراكية' }, { word: 'Capitalisme', ar: 'رأسمالية' },
    { word: 'Libéralisme', ar: 'ليبرالية' }, { word: 'Conservatisme', ar: 'محافظة' }, { word: 'Nationalisme', ar: 'قومية' },
    { word: 'Impérialisme', ar: 'إمبريالية' }, { word: 'Colonialisme', ar: 'استعمار' }, { word: 'Décolonisation', ar: 'إنهاء الاستعمار' },
    { word: 'Néocolonialisme', ar: 'استعمار جديد' }, { word: 'Mondialisation', ar: 'عولمة' }, { word: 'Interdépendance', ar: 'الترابط' },
    { word: 'Coopération internationale', ar: 'التعاون الدولي' }, { word: 'Conflits armés', ar: 'صراعات مسلحة' }, { word: 'Terrorisme', ar: 'إرهاب' },
    { word: 'Guerre civile', ar: 'حرب أهلية' }, { word: 'Coup d\'État', ar: 'انقلاب' }, { word: 'Réfugiés', ar: 'لاجئون' },
    { word: 'Migrations', ar: 'هجرات' }, { word: 'Diaspora', ar: 'شتات' }, { word: 'Identité nationale', ar: 'الهوية الوطنية' },
    { word: 'Citoyenneté', ar: 'المواطنة' }, { word: 'Droits civiques', ar: 'الحقوق المدنية' }, { word: 'Droits politiques', ar: 'الحقوق السياسية' },
    { word: 'Droits économiques', ar: 'الحقوق الاقتصادية' }, { word: 'Droits sociaux', ar: 'الحقوق الاجتماعية' }, { word: 'Droits culturels', ar: 'الحقوق الثقافية' },
    { word: 'Droits de l\'environnement', ar: 'الحقوق البيئية' }, { word: 'Développement durable', ar: 'التنمية المستدامة' }, { word: 'Changement climatique', ar: 'تغير المناخ' },
    { word: 'Justice climatique', ar: 'العدالة المناخية' }, { word: 'Énergie renouvelable', ar: 'الطاقة المتجددة' }, { word: 'Transition énergétique', ar: 'الانتقال الطاقوي' },
    { word: 'Sécurité alimentaire', ar: 'الأمن الغذائي' }, { word: 'Souveraineté alimentaire', ar: 'السيادة الغذائية' }, { word: 'Accès à l\'eau', ar: 'الوصول إلى الماء' },
    { word: 'Santé publique', ar: 'الصحة العامة' }, { word: 'Éducation pour tous', ar: 'التعليم للجميع' }, { word: 'Égalité des sexes', ar: 'المساواة بين الجنسين' },
    { word: 'Réduction des inégalités', ar: 'الحد من عدم المساواة' }, { word: 'Villes durables', ar: 'مدن مستدامة' }, { word: 'Consommation responsable', ar: 'الاستهلاك المسؤول' },
    { word: 'Production durable', ar: 'الإنتاج المستدام' }, { word: 'Économie circulaire', ar: 'الاقتصاد الدائري' }, { word: 'Gestion des déchets', ar: 'إدارة النفايات' },
    { word: 'Recyclage', ar: 'إعادة التدوير' }, { word: 'Biodiversité', ar: 'التنوع البيولوجي' }, { word: 'Protection de l\'environnement', ar: 'حماية البيئة' },
    { word: 'Ressources naturelles', ar: 'الموارد الطبيعية' }, { word: 'Déforestation', ar: 'إزالة الغابات' }, { word: 'Désertification', ar: 'التصحر' },
    { word: 'Pollution de l\'air', ar: 'تلوث الهواء' }, { word: 'Pollution de l\'eau', ar: 'تلوث الماء' }, { word: 'Pollution des sols', ar: 'تلوث التربة' },
    { word: 'Catastrophes naturelles', ar: 'الكوارث الطبيعية' }, { word: 'Prévention des risques', ar: 'الوقاية من المخاطر' }, { word: 'Gestion des crises', ar: 'إدارة الأزمات' },
    { word: 'Aide humanitaire', ar: 'المساعدات الإنسانية' }, { word: 'Développement économique', ar: 'التنمية الاقتصادية' }, { word: 'Croissance économique', ar: 'النمو الاقتصادي' },
    { word: 'Développement humain', ar: 'التنمية البشرية' }, { word: 'Indice de développement humain (IDH)', ar: 'مؤشر التنمية البشرية' }, { word: 'Pauvreté', ar: 'الفقر' },
    { word: 'Inégalités', ar: 'عدم المساواة' }, { word: 'Exclusion sociale', ar: 'الإقصاء الاجتماعي' }, { word: 'Inclusion sociale', ar: 'الإدماج الاجتماعي' },
    { word: 'Protection sociale', ar: 'الحماية الاجتماعية' }, { word: 'Sécurité sociale', ar: 'الضمان الاجتماعي' }, { word: 'Chômage', ar: 'البطالة' },
    { word: 'Emploi', ar: 'التوظيف' }, { word: 'Travail décent', ar: 'العمل اللائق' }, { word: 'Droits du travail', ar: 'حقوق العمل' },
    { word: 'Syndicats', ar: 'النقابات' }, { word: 'Grève', ar: 'إضراب' }, { word: 'Négociation collective', ar: 'المفاوضة الجماعية' },
    { word: 'Dialogue social', ar: 'الحوار الاجتماعي' }, { word: 'Relations internationales', ar: 'العلاقات الدولية' }, { word: 'Géopolitique', ar: 'الجغرافيا السياسية' },
  ];

  const startIndex = (levelNum - 1) * 15;
  const selectedTerms = terms.slice(startIndex, startIndex + 15);

  return selectedTerms.map((term, index) => {
    const incorrectOptions = shuffleArray(terms.filter(t => t.ar !== term.ar).map(t => t.ar)).slice(0, 2);
    return {
      id: `fr-th${levelNum}-q${index + 1}`,
      type: 'word-translation',
      questionText: term.word,
      options: shuffleArray([term.ar, ...incorrectOptions]),
      correct: term.ar,
    };
  });
};

export const frenchQuizData = {
  sections: {
    'texte-historique': {
      levels: Array.from({ length: 10 }, (_, i) => `level${i + 1}`).reduce((acc, levelName, idx) => {
        acc[levelName] = generateFrenchHistoryTextQuestions(idx + 1);
        return acc;
      }, {} as Record<string, Question[]>),
    },
  },
};
