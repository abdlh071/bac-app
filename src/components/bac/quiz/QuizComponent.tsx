// src/components/bac/quiz/QuizComponent.tsx

import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Question, shuffleArray } from './types';
import { englishQuizData } from './english';
import { frenchQuizData } from './french';
import { coldWarDates, algerianRevolutionDates, generateHistoryQuestions } from './history';
import { naturalSciencesQuizData } from './naturalSciences';
import { mathematicsQuizData } from './mathematics';
import { physicsQuizData } from './physics';
import { arabicQuizData } from './arabic';
import { islamicStudiesQuizData } from './islamicStudies';
import { geographyQuizData } from './geography';
import { philosophyQuizData } from './philosophy';

interface QuizComponentProps {
    quizConfig: {
        subject: string;
        section: string;
        level: string;
    };
    onBack: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizConfig, onBack }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [totalTimeLeft, setTotalTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState<({ question: Question; userAnswer: string | null; isCorrect: boolean })[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [retryTrigger, setRetryTrigger] = useState(0);

    useEffect(() => {
        setIsLoading(true);
        let selectedQuestions: Question[] = [];
        let requiredQuestionCount = 15;

        const { subject, section, level } = quizConfig;

        switch (subject) {
            case 'english':
                const englishSection = englishQuizData.sections[section as keyof typeof englishQuizData.sections];
                if (level === 'all-levels') {
                    let allSectionQuestions: Question[] = [];
                    const levels = englishSection?.levels || {};
                    for (const levelKey in levels) {
                        allSectionQuestions = allSectionQuestions.concat(levels[levelKey as keyof typeof levels]);
                    }
                    selectedQuestions = shuffleArray(allSectionQuestions).slice(0, 30);
                    requiredQuestionCount = 30;
                } else {
                    selectedQuestions = englishSection?.levels[level as keyof typeof englishSection.levels] || [];
                    requiredQuestionCount = 15;
                }
                break;

            case 'french':
                const frenchSection = frenchQuizData.sections[section as keyof typeof frenchQuizData.sections];
                if (level === 'all-levels') {
                    let allSectionQuestions: Question[] = [];
                    const levels = frenchSection?.levels || {};
                    for (const levelKey in levels) {
                        allSectionQuestions = allSectionQuestions.concat(levels[levelKey as keyof typeof levels]);
                    }
                    selectedQuestions = shuffleArray(allSectionQuestions).slice(0, 30);
                    requiredQuestionCount = 30;
                } else {
                    selectedQuestions = frenchSection?.levels[level as keyof typeof frenchSection.levels] || [];
                    requiredQuestionCount = 15;
                }
                break;

            case 'history':
                const historyData = section === 'cold-war' ? coldWarDates : algerianRevolutionDates;
                const allHistoryQuestions = generateHistoryQuestions(historyData, section);
                const shuffledHistoryQuestions = shuffleArray(allHistoryQuestions);

                if (level === 'level1') {
                    selectedQuestions = shuffledHistoryQuestions.slice(0, 15);
                } else if (level === 'level2') {
                    selectedQuestions = shuffledHistoryQuestions.slice(15, 30);
                }
                requiredQuestionCount = 15;
                break;

            case 'natural-sciences':
                const naturalSciencesSection = naturalSciencesQuizData.sections[section as keyof typeof naturalSciencesQuizData.sections];
                if (level === 'all-levels') {
                    let allSectionQuestions: Question[] = [];
                    const levels = naturalSciencesSection?.levels || {};
                    for (const levelKey in levels) {
                        allSectionQuestions = allSectionQuestions.concat(levels[levelKey as keyof typeof levels]);
                    }
                    selectedQuestions = shuffleArray(allSectionQuestions).slice(0, 30);
                    requiredQuestionCount = 30;
                } else {
                    selectedQuestions = naturalSciencesSection?.levels[level as keyof typeof naturalSciencesSection.levels] || [];
                    requiredQuestionCount = 15;
                }
                break;

            case 'mathematics':
                const mathematicsSection = mathematicsQuizData.sections[section as keyof typeof mathematicsQuizData.sections];
                if (level === 'all-levels') {
                    let allSectionQuestions: Question[] = [];
                    const levels = mathematicsSection?.levels || {};
                    for (const levelKey in levels) {
                        allSectionQuestions = allSectionQuestions.concat(levels[levelKey as keyof typeof levels]);
                    }
                    selectedQuestions = shuffleArray(allSectionQuestions).slice(0, 30);
                    requiredQuestionCount = 30;
                } else {
                    selectedQuestions = mathematicsSection?.levels[level as keyof typeof mathematicsSection.levels] || [];
                    requiredQuestionCount = 15;
                }
                break;

            case 'physics':
                const physicsSection = physicsQuizData.sections[section as keyof typeof physicsQuizData.sections];
                if (level === 'all-levels') {
                    let allSectionQuestions: Question[] = [];
                    const levels = physicsSection?.levels || {};
                    for (const levelKey in levels) {
                        allSectionQuestions = allSectionQuestions.concat(levels[levelKey as keyof typeof levels]);
                    }
                    selectedQuestions = shuffleArray(allSectionQuestions).slice(0, 30);
                    requiredQuestionCount = 30;
                } else {
                    selectedQuestions = physicsSection?.levels[level as keyof typeof physicsSection.levels] || [];
                    requiredQuestionCount = 15;
                }
                break;

            case 'arabic':
                const arabicSection = arabicQuizData.sections[section as keyof typeof arabicQuizData.sections];
                if (level === 'all-levels') {
                    let allSectionQuestions: Question[] = [];
                    const levels = arabicSection?.levels || {};
                    for (const levelKey in levels) {
                        allSectionQuestions = allSectionQuestions.concat(levels[levelKey as keyof typeof levels]);
                    }
                    selectedQuestions = shuffleArray(allSectionQuestions).slice(0, 30);
                    requiredQuestionCount = 30;
                } else {
                    selectedQuestions = arabicSection?.levels[level as keyof typeof arabicSection.levels] || [];
                    requiredQuestionCount = 15;
                }
                break;

            case 'islamic-studies':
                const islamicSection = islamicStudiesQuizData.sections[section as keyof typeof islamicStudiesQuizData.sections];
                selectedQuestions = islamicSection?.questions || [];
                requiredQuestionCount = 15;
                break;

            case 'geography':
                const geographySection = geographyQuizData.sections[section as keyof typeof geographyQuizData.sections];
                selectedQuestions = geographySection?.questions || [];
                requiredQuestionCount = 15;
                break;

            case 'philosophy':
                const philosophySection = philosophyQuizData.sections[section as keyof typeof philosophyQuizData.sections];
                selectedQuestions = philosophySection?.questions || [];
                requiredQuestionCount = 15;
                break;
        }

        const finalQuestions = selectedQuestions.map(q => ({
            ...q,
            options: shuffleArray([...q.options])
        }));

        setQuestions(finalQuestions);
        setTotalTimeLeft(requiredQuestionCount * 60);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setScore(0);
        setUserAnswers([]);
        setIsFinished(false);
        setIsLoading(false);
    }, [quizConfig, retryTrigger]);

    useEffect(() => {
        if (isLoading || isFinished) return;

        const timer = setInterval(() => {
            setTotalTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsFinished(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isLoading, isFinished]);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer !== null) return;

        const currentQ = questions[currentQuestionIndex];
        const isCorrect = answer === currentQ.correct;

        setSelectedAnswer(answer);

        setUserAnswers(prev => [
            ...prev,
            { question: currentQ, userAnswer: answer, isCorrect: isCorrect }
        ]);

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setIsFinished(true);
            }
        }, 1500);
    };

    const resetQuiz = () => {
        setRetryTrigger(prev => prev + 1);
    };
    
    const getQuizTitle = () => {
        const { subject, section, level } = quizConfig;
        let title = '';
        
        const subjectTitles: Record<string, string> = {
            'english': 'اللغة الإنجليزية',
            'french': 'اللغة الفرنسية',
            'history': 'التاريخ',
            'natural-sciences': 'العلوم الطبيعية والحياة',
            'mathematics': 'الرياضيات',
            'physics': 'العلوم الفيزيائية',
            'arabic': 'اللغة العربية',
            'islamic-studies': 'العلوم الإسلامية',
            'geography': 'الجغرافيا',
            'philosophy': 'الفلسفة'
        };

        const sectionTitles: Record<string, string> = {
            // English sections
            'grammar': 'القواعد',
            'ethics': 'أخلاقيات العمل',
            'safety': 'السلامة أولاً',
            'astronomy': 'الفلك',
            // French sections
            'texte-historique': 'نصوص تاريخية',
            // History sections
            'cold-war': 'وحدة الحرب الباردة',
            'algerian-revolution': 'وحدة الثورة الجزائرية',
            // Natural Sciences sections
            'protein-synthesis': 'تركيب البروتين',
            'protein-structure-function': 'العلاقة بين بنية ووظيفة البروتين',
            'enzyme-sharing': 'المشاطر الإنزيمية',
            'proteins-defense': 'دور البروتينات في الدفاع عن الذات',
            'proteins-neural': 'دور البروتينات في الاتصال العصبي',
            'photosynthesis': 'تحويل الطاقة الضوئية إلى طاقة كيميائية كاملة',
            'respiration-fermentation': 'التنفس والتخمر',
            // Mathematics sections
            'functions': 'الدوال',
            'sequences': 'المتتاليات',
            'probability': 'الاحتمالات',
            'complex-numbers': 'الأعداد المركبة',
            'numbers-calculation': 'الأعداد والحساب',
            'space-geometry': 'الهندسة في الفضاء',
            // Physics sections
            'chemical-kinetics': 'المتابعة الزمنية للتحول الكيميائي',
            'mechanical-evolution': 'تطور جملة ميكانيكية',
            'electrical-phenomena': 'الظواهر الكهربائية',
            'chemical-equilibrium': 'تطور جملة كيميائية نحو التوازن',
            'chemical-monitoring': 'مناقبة تطور جملة كيميائية',
            'nuclear-transformations': 'التحويلات النووية',
            // Arabic sections
            'linguistic-structure': 'البناء اللغوي',
            'intellectual-structure': 'البناء الفكري',
            'bac-parsing': 'إعراب من البكالوريات',
            'bac-metaphors': 'استعارات من البكالوريات',
            'bac-questions': 'أسئلة من البكالوريا',
            // Other sections
            'comprehensive': 'كويزات شاملة',
            'unit-1': 'الوحدة 1',
            'unit-2': 'الوحدة 2',
            'philosophical-quotes': 'أقوال فلسفية'
        };

        title = subjectTitles[subject] || subject;
        if (section && sectionTitles[section]) {
            title += ' - ' + sectionTitles[section];
        }
        
        if (level === 'all-levels') {
            title += ' - كل المستويات';
        } else if (level && level !== 'level1') {
            title += ` - المستوى ${level.replace('level', '')}`;
        }
        
        return title;
    };
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    if (isLoading) {
        return (
            <div className="p-6 text-center">
                <div className="text-gray-600 animate-pulse">جاري تحضير الكويز...</div>
            </div>
        );
    }
    
    if (isFinished) {
        const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
        return (
            <div className="p-6 pb-20">
                <div className="flex items-center mb-6">
                    <button
                        onClick={onBack}
                        className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <ArrowRight size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">نتائج الكويز</h1>
                </div>
    
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                            percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                            {percentage >= 70 ? (
                                <CheckCircle className="text-green-600" size={48} />
                            ) : (
                                <XCircle className="text-red-600" size={48} />
                            )}
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            {percentage >= 70 ? 'أحسنت!' : percentage >= 50 ? 'جيد!' : 'حاول مرة أخرى!'}
                        </h2>
                        
                        <div className="text-6xl font-bold mb-4 text-blue-600">
                            {percentage}%
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            لقد أجبت على {score} من أصل {questions.length} أسئلة بشكل صحيح
                        </p>
                    </div>
    
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">مراجعة الإجابات</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {userAnswers.map((item, index) => {
                                const { question, userAnswer, isCorrect } = item;
                                
                                return (
                                    <div key={index} className={`p-4 rounded-xl border-2 ${
                                        isCorrect  ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-lg text-right">{question.questionText}</span>
                                            {isCorrect ? (
                                                <CheckCircle className="text-green-600" size={24} />
                                            ) : (
                                                <XCircle className="text-red-600" size={24} />
                                            )}
                                        </div>
                                        
                                        <div className="text-sm space-y-1 text-right">
                                            <div className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                إجابتك: {userAnswer || 'لم تجب'}
                                            </div>
                                            {!isCorrect && (
                                                <div className="text-green-700 font-medium">
                                                    الإجابة الصحيحة: {question.correct}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={resetQuiz}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                        >
                            إعادة المحاولة
                        </button>
                        <button
                            onClick={onBack}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                        >
                            العودة للقائمة
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) {
        return (
            <div className="p-6 text-center">
                <div className="text-gray-600">لا توجد أسئلة لهذا الكويز.</div>
                <button onClick={onBack} className="mt-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                    <ArrowRight size={20} /> العودة
                </button>
            </div>
        );
    }
    
    return (
        <div className="p-6 pb-20">
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <ArrowRight size={20} />
                </button>
                <div className="flex-1 text-right">
                    <h1 className="text-xl font-bold text-gray-800">{getQuizTitle()}</h1>
                    <p className="text-gray-600 text-sm">
                        السؤال {currentQuestionIndex + 1} من {questions.length}
                    </p>
                </div>
            </div>
    
            <div className="bg-white rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-lg font-semibold text-gray-800">
                        {currentQuestionIndex + 1}/{questions.length}
                    </div>
                    <div className={`flex items-center space-x-2 ${totalTimeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
                        <Clock size={20} />
                        <span className="font-bold">الوقت المتبقي: {formatTime(totalTimeLeft)}</span>
                    </div>
                </div>
    
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        {currentQ.questionText}
                    </h2>
                    {currentQ.type === 'word-translation' && <p className="text-gray-600">اختر الترجمة الصحيحة</p>}
                    {currentQ.type === 'date-event' && <p className="text-gray-600">اختر الحدث الصحيح</p>}
                    {currentQ.type === 'event-date' && <p className="text-gray-600">اختر التاريخ الصحيح</p>}
                    {currentQ.type === 'grammar-transform' && <p className="text-gray-600">اختر الاجابة الصحيحة</p>}
                    {currentQ.type === 'grammar-mcq' && <p className="text-gray-600">اختر الإجابة الصحيحة</p>}
                    {currentQ.type === 'grammar-sound' && <p className="text-gray-600">{currentQ.context || 'اختر الكلمة الصحيحة'}</p>}
                </div>
    
                <div className="space-y-4">
                    {currentQ.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            disabled={selectedAnswer !== null}
                            className={`w-full p-4 rounded-xl text-right transition-all duration-300 ${
                                selectedAnswer !== null
                                    ? option === currentQ.correct
                                        ? 'bg-green-100 border-2 border-green-500 text-green-800'
                                        : option === selectedAnswer
                                          ? 'bg-red-100 border-2 border-red-500 text-red-800'
                                        : 'bg-gray-100 text-gray-500'
                                    : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-800'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
    
                <div className="mt-6 bg-gray-100 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuizComponent;
