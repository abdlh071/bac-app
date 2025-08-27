import React, { useState, useEffect, useRef } from 'react';
import { Send, BrainCircuit, Loader2, Book, AlertTriangle, ChevronLeft, Lightbulb, Check, X, ClipboardList, ListTodo } from 'lucide-react';

// Define the shape of a chat message object to ensure type safety in TypeScript
interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  // Define possible message types for conditional rendering
  type?: 'thinking' | 'loading-quiz' | 'loading-summary' | 'loading-study-plan' | 'quiz' | 'summary' | 'study-plan' | 'disclaimer' | 'error';
  // Optional data fields for special message types
  quiz?: QuizQuestion[];
  plan?: StudyPlanMilestone[];
}

// Define the shape of a quiz question
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Define the shape of a study plan milestone
interface StudyPlanMilestone {
  milestone: string;
  duration: string;
  tasks: string[];
}

/**
 * @file AIChatPage.tsx
 * @description This component provides a dedicated page for AI-powered chat interaction.
 * It handles the state for messages, user input, and API calls to the Gemini model.
 */
const AIChatPage = ({ onClose }: { onClose: () => void }) => {
  // State for all chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State for the current user input
  const [input, setInput] = useState<string>('');
  // State to manage loading status for API calls
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to store and display any errors
  const [error, setError] = useState<string | null>(null);
  // Reference to the end of the chat container for auto-scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // The API key will be automatically provided by the Canvas environment
  const apiKey = "AIzaSyCn3sVeTkMqu1m5TEUcq8xwMQx2z_HCbdc";
  
  // Utility function to format text with simple Markdown (bolding) and newlines
  const formatTextWithMarkdown = (text: string) => {
    // Replace **bold** with <strong>bold</strong> and handle newlines with <br />
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: formattedText.replace(/\n/g, '<br />') };
  };

  // Effect to automatically scroll to the bottom of the chat when new messages arrive or an error occurs.
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, error]);
  
  // Main function to handle sending a message to the Gemini API.
  const handleSendMessage = async (messageText: string = input) => {
    if (messageText.trim() === '') return;
    setError(null);

    // Add the user's message to the chat history and clear the input field
    const userMessage: Message = { text: messageText, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add a custom "thinking" message with a loader while the AI processes the request
    const thinkingMessage: Message = { id: 'thinking', sender: 'ai', type: 'thinking', text: '' };
    setMessages(prevMessages => [...prevMessages, thinkingMessage]);

    try {
      // The core system prompt with detailed curriculum knowledge.
      const systemPrompt = `
        أنت مساعد ذكاء اصطناعي خاص بتطبيق ريفيزا، مهمتك الأساسية هي مساعدة طلاب بكالوريا 2026 في الجزائر. 
        اجب على الأسئلة المتعلقة بالدروس، المراجعة، الجداول، والنصائح الأكاديمية. كن ودوداً ومباشراً وداعماً في إجاباتك.
        استخدم اللغة العربية الفصحى ولهجة جزائرية عند الحاجة لزيادة الفهم والود.
        
        **مناهج البكالوريا التي لديك معرفة بها:**
        
        * **الرياضيات:**
            -   **الدوال:** الدوال الأسية، اللوغاريتمية، ومتعددات الحدود. مفاهيم مثل الاشتقاق، النهايات، نقاط الانعطاف.
            -   **المتتاليات:** المتتاليات الهندسية والعددية.
            -   **الاحتمالات:** القائمة، الترتيبة، التوفيقة.
            -   **الدوال الأصلية:** الدوال الأصلية من الدرجة الأولى.
            -   **الأعداد المركبة:** تمرينات حول التحويلات الهندسية، الشكل المثلثي والجبري، والأسئلة المتعلقة بها.
        
        * **الفيزياء:**
            -   **المتابعة الزمنية للتفاعلات:** تفاعلات الأكسدة والإرجاع، الحمض-أساس، والإسترة. نقاط مثل زمن نصف التفاعل، المزيج الستوكيومتري، حساب السرعات، والمتفاعل المحد.
            -   **التحولات النووية:** الانشطار، الاندماج، تفاعلات ألفا وبيتا وغاما، وحساب عمر العينات.
            -   **الكهرباء:** دارات RC و RL على التسلسل. أسئلة حول حساب الطاقة، استخراج المعادلات، والحلول.
            -   **الميكانيك:** القذيفة، السقوط الحر، السقوط الشاقولي، المستوي المائل، وحركة الأقمار. أسئلة عن طبيعة الحركة، كتابة القوى، وقوانين نيوتن وكبلر.
            
        * **اللغة الإنجليزية:**
            -   **الوحدة 1 (Ethics in Business):** أخلاقيات العمل، الأعمال غير القانونية، ومصطلحات مثل bribery, corruption, child labor.
            -   **الوحدة 2 (Safety First):** نصوص حول مضار الأكل غير الصحي ودور الإعلانات المضللة.
            -   **الوحدة 3 (Space):** الأقمار، الكواكب، المجرات، والطاقة الشمسية.
            -   **القواعد:** قواعد الشرط والتمني.
            -   **الهدف:** مساعدة الطالب على تعلم المصطلحات لفهم النصوص.
        
        * **اللغة الفرنسية:**
            -   **الوحدة 1 (Texte d'histoire):** تاريخ الجزائر، المقاومة الشعبية، الثورة، ومصطلحات ثورية.
            -   **الوحدة 2 (Débat d'idée):** النصوص الجدلية التي تناقش وجهات نظر مختلفة.
            -   **الوحدة 3 (L'appel):** النصوص التي تحتوي على نداءات وتوجيهات.
            -   **الهدف:** مساعدة الطالب على تعلم المصطلحات لفهم النصوص.
        
        * **التاريخ والجغرافيا:**
            -   **التاريخ:** الحرب الباردة (أسبابها، مظاهرها، الانفراج الدولي)، الثورة الجزائرية (استراتيجياتها، استراتيجيات فرنسا).
            -   **مصطلحات وتواريخ هامة:** القطبية الثنائية، عالم الشمال، عالم الجنوب، الليبرالية، سياسة المشاريع، سياسة الاحتواء، مشروع إيزنهاور، التوازن النووي، التعايش السلمي، سياسة ملء الفراغ. بالإضافة إلى تواريخ مثل 01 نوفمبر 1954، 19 مارس 1962، 05 جويلية 1962 وغيرها.
        
        * **العلوم الطبيعية:**
            -   **مجال البروتينات:** تركيب البروتين (الاستنساخ والترجمة)، البنية الفراغية للبروتين، دوره في النشاط الإنزيمي والمناعة (الذات واللاذات، الاستجابة الخلطية والخلوية، فيروس VIH)، ودوره في الرسالة العصبية (كمون العمل، كمون الراحة).
            -   **مجال النباتات:** عملية التركيب الضوئي (مرحلتيه)، التنفس والتخمر.
        
        **مواضيع أخرى:**
        -   نصائح للدراسة والإنتاجية (شرب الماء، إزالة المشتتات).
        -   أسئلة عامة مثل "ما هو ريفيزا؟".
        
        **تذكر:** مهمتك هي توجيه الطلاب وإعطائهم إجابات دقيقة ومفيدة بناءً على هذه المعرفة. كن مرناً في إجاباتك ولا تتقيد فقط بالنقاط المذكورة، بل استخدمها كنقطة انطلاق لتقديم المساعدة.
        
        إليك سؤال المستخدم:
      `;
      const fullPrompt = `${systemPrompt} ${messageText}`;
      
      const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorDetail = `API error: ${response.statusText || 'Unknown error'}`;
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorDetail = errorData.error.message;
          }
        } catch (e) {
          console.error('Could not parse error response body:', e);
        }
        throw new Error(errorDetail);
      }

      const result = await response.json();
      const aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      // Remove the thinking message and add the final AI response
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== 'thinking'));

      if (aiResponseText) {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: aiResponseText, sender: 'ai' }
        ]);
      } else {
        throw new Error('AI response was empty. This may be due to safety filters.');
      }
    } catch (err: any) {
      console.error('Error fetching AI response:', err);
      // Remove thinking message and add the error message
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== 'thinking'));
      if (err.message.includes('safety')) {
        setError('لم يتمكن الذكاء الاصطناعي من الإجابة. قد يكون المحتوى غير لائق أو مخالفًا لسياسات الاستخدام.');
      } else if (err.message.includes('API error')) {
        setError('حدث خطأ في الاتصال بالخادم: ' + err.message);
      }
      else {
        setError('حدث خطأ غير متوقع: ' + (err.message || 'يرجى المحاولة مرة أخرى.'));
      }
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * Function to generate a quiz from an AI message using the Gemini API.
   * It sends the message content with a specific prompt and JSON schema.
   */
  const handleGenerateQuiz = async (text: string) => {
    // Prevent multiple quiz generations at the same time
    if (isLoading) return;

    // Add a loading message to the chat
    const loadingQuizMessage: Message = { id: Date.now().toString(), sender: 'ai', type: 'loading-quiz', text: '' };
    setMessages(prevMessages => [...prevMessages, loadingQuizMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Updated prompt to specifically request 5 educational questions related to the curriculum
      const prompt = `استخدم النص التالي لإنشاء اختبار قصير من 5 أسئلة تعليمية من منهج بكالوريا 2026 في الجزائر. لكل سؤال، قدم 4 خيارات، وحدد الإجابة الصحيحة. أرجع النتيجة بتنسيق JSON.
      النص: "${text}"`;

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];

      // Define the JSON schema for the quiz questions
      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { "type": "STRING" },
                options: { "type": "ARRAY", "items": { "type": "STRING" } },
                correctAnswer: { "type": "STRING" }
              }
            }
          }
        }
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      const quizJson = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (quizJson) {
        const quizData: QuizQuestion[] = JSON.parse(quizJson);
        const quizMessage: Message = {
          id: Date.now().toString(),
          text: 'هذا اختبار قصير لمراجعة ما تعلمته!',
          sender: 'ai',
          type: 'quiz',
          quiz: quizData,
        };
        // Replace the loading message with the actual quiz
        setMessages(prevMessages => prevMessages.map(msg => msg.type === 'loading-quiz' ? quizMessage : msg));
      } else {
        throw new Error('فشل في إنشاء الاختبار. حاول مرة أخرى.');
      }
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      // Replace the loading message with an error message
      setMessages(prevMessages => prevMessages.map(msg => msg.type === 'loading-quiz' ? { ...msg, type: 'error', text: 'فشل في إنشاء الاختبار. قد يكون المحتوى قصيرًا جدًا.'} : msg));
      setError('حدث خطأ أثناء إنشاء الاختبار: ' + (err.message || 'يرجى المحاولة مرة أخرى.'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Function to generate a summary from an AI message using the Gemini API.
   * It sends the message content with a specific prompt.
   */
  const handleGenerateSummary = async (text: string) => {
    // Prevent multiple summary generations at the same time
    if (isLoading) return;
    
    // Add a loading message to the chat
    const loadingSummaryMessage: Message = { id: Date.now().toString(), sender: 'ai', type: 'loading-summary', text: '' };
    setMessages(prevMessages => [...prevMessages, loadingSummaryMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = `الخص النص التالي في نقاط موجزة للمساعدة على المراجعة. النص: "${text}"`;
      
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      const summaryText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (summaryText) {
        const summaryMessage: Message = {
          id: Date.now().toString(),
          text: `ملخص: ${summaryText}`,
          sender: 'ai',
          type: 'summary',
        };
        setMessages(prevMessages => prevMessages.map(msg => msg.type === 'loading-summary' ? summaryMessage : msg));
      } else {
        throw new Error('فشل في إنشاء الملخص. حاول مرة أخرى.');
      }
    } catch (err: any) {
      console.error('Error generating summary:', err);
      setMessages(prevMessages => prevMessages.map(msg => msg.type === 'loading-summary' ? { ...msg, type: 'error', text: 'فشل في إنشاء الملخص. قد يكون المحتوى قصيرًا جدًا.'} : msg));
      setError('حدث خطأ أثناء إنشاء الملخص: ' + (err.message || 'يرجى المحاولة مرة أخرى.'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Function to generate a study plan from an AI message using the Gemini API.
   * It sends the message content with a specific prompt and a JSON schema for a structured plan.
   */
  const handleGenerateStudyPlan = async (text: string) => {
    if (isLoading) return;

    const loadingStudyPlanMessage: Message = { id: Date.now().toString(), sender: 'ai', type: 'loading-study-plan', text: '' };
    setMessages(prevMessages => [...prevMessages, loadingStudyPlanMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `بناءً على هذا النص، أنشئ خطة دراسية من 3 إلى 4 مراحل. لكل مرحلة، حدد اسم المرحلة (مثلاً: فهم الأساسيات) والمدة الزمنية (مثلاً: أسبوع واحد)، وقائمة بالمهام التي يجب إنجازها. أرجع الإجابة بتنسيق JSON.
      النص: "${text}"`;

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      
      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                milestone: { "type": "STRING" },
                duration: { "type": "STRING" },
                tasks: { "type": "ARRAY", "items": { "type": "STRING" } }
              }
            }
          }
        }
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      const studyPlanJson = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (studyPlanJson) {
        const studyPlanData: StudyPlanMilestone[] = JSON.parse(studyPlanJson);
        const studyPlanMessage: Message = {
          id: Date.now().toString(),
          text: 'هذه خطة دراسية مقترحة!',
          sender: 'ai',
          type: 'study-plan',
          plan: studyPlanData,
        };
        setMessages(prevMessages => prevMessages.map(msg => msg.type === 'loading-study-plan' ? studyPlanMessage : msg));
      } else {
        throw new Error('فشل في إنشاء الخطة الدراسية. حاول مرة أخرى.');
      }
    } catch (err: any) {
      console.error('Error generating study plan:', err);
      setMessages(prevMessages => prevMessages.map(msg => msg.type === 'loading-study-plan' ? { ...msg, type: 'error', text: 'فشل في إنشاء الخطة الدراسية. قد يكون المحتوى قصيرًا جدًا.'} : msg));
      setError('حدث خطأ أثناء إنشاء الخطة الدراسية: ' + (err.message || 'يرجى المحاولة مرة أخرى.'));
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * Component for displaying the quiz interface.
   */
  const QuizDisplay = ({ quiz }: { quiz: QuizQuestion[] }) => {
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState<number>(0);
    const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);

    const handleAnswer = (questionIndex: number, selectedOption: string) => {
      if (userAnswers[questionIndex]) return;

      const updatedAnswers = { ...userAnswers, [questionIndex]: selectedOption };
      setUserAnswers(updatedAnswers);

      if (selectedOption === quiz[questionIndex].correctAnswer) {
        setScore(prevScore => prevScore + 1);
      }

      // Check if all questions have been answered.
      // This is now fixed to check against the number of questions in the quiz.
      if (Object.keys(updatedAnswers).length === quiz.length) {
        setIsQuizComplete(true);
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-xl shadow-md space-y-4 text-sm mt-2" dir="rtl">
        {quiz.map((q, index) => (
          <div key={index} className="space-y-2">
            <p className="font-bold text-gray-900 dark:text-white">
              {index + 1}. {q.question}
            </p>
            <div className="space-y-1">
              {q.options.map((option, optionIndex) => {
                const isCorrect = option === q.correctAnswer;
                const isSelected = userAnswers[index] === option;
                let bgColor = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
                let textColor = 'text-gray-900 dark:text-gray-100';
                let icon = null;

                if (isSelected) {
                  bgColor = isCorrect ? 'bg-green-200 dark:bg-green-700' : 'bg-red-200 dark:bg-red-700';
                  textColor = isCorrect ? 'text-green-800 dark:text-green-100' : 'text-red-800 dark:text-red-100';
                  icon = isCorrect ? <Check size={16} /> : <X size={16} />;
                } else if (isQuizComplete && isCorrect) {
                  bgColor = 'bg-green-100 dark:bg-green-900';
                  textColor = 'text-green-800 dark:text-green-200';
                }

                return (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswer(index, option)}
                    className={`flex items-center justify-between w-full text-right p-2 rounded-lg transition-colors ${bgColor} ${textColor}`}
                    disabled={!!userAnswers[index]}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {isQuizComplete && (
          <div className="text-center font-bold text-lg mt-4">
            <p className="text-gray-900 dark:text-white">
              نتيجتك: {score} من {quiz.length}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              قم بزيارة قسم الكويز الذي يحتوي على اكثر من 900 كويز
            </p>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Component for displaying the study plan.
   */
  const StudyPlanDisplay = ({ plan }: { plan: StudyPlanMilestone[] }) => (
    <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-xl shadow-md space-y-4 text-sm mt-2" dir="rtl">
      <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-4">خطة دراسية مقترحة:</h3>
      {plan.map((milestone, index) => (
        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
          <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-white mb-2">
            <span>{index + 1}. {milestone.milestone}</span>
            <span className="text-xs text-blue-500 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">{milestone.duration}</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {milestone.tasks.map((task, taskIndex) => (
              <li key={taskIndex}>{task}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
      {/* Header section with back button and title */}
      <div className="flex items-center justify-between p-2 sm:p-4 bg-white dark:bg-gray-800 shadow-md">
        <button
          onClick={onClose}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">مساعد ريفيسا للبكالوريا 2026</h1>
        <Book className="text-blue-500" size={24} />
      </div>

      {/* Main chat messages area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
        {messages.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-between h-full text-center text-gray-400 p-4">
            {/* Welcome message when the chat is empty */}
            <div className="flex flex-col items-center justify-center flex-1">
              <BrainCircuit className="w-16 h-16 mb-4 text-blue-400" />
              <p className="text-lg font-medium">أهلاً بك! أنا مساعدك الخاص للبكالوريا 2026.</p>
              <p className="text-sm">اسألني عن دروسك، نصائح للمراجعة، أو أي شيء يخص تحضيرك للبكالوريا 2026.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex flex-col p-3 max-w-[80%] rounded-2xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-400 text-white rounded-br-none text-right'
                    : 'bg-sky-100 dark:bg-sky-900 text-gray-900 dark:text-gray-100 rounded-bl-none text-right'
                }`}
                style={{ direction: 'rtl' }}
              >
                {/* Regular text message and summary */}
                {(msg.type === undefined || msg.type === 'summary' || msg.type === 'error' || msg.type === 'disclaimer') && (
                  <div dangerouslySetInnerHTML={formatTextWithMarkdown(msg.text)} />
                )}

                {/* Quiz display component */}
                {msg.type === 'quiz' && (
                  <QuizDisplay quiz={msg.quiz!} />
                )}
                
                {/* Study Plan display component */}
                {msg.type === 'study-plan' && (
                  <StudyPlanDisplay plan={msg.plan!} />
                )}
                
                {/* Thinking message with loader */}
                {msg.type === 'thinking' && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Loader2 className="animate-spin" size={20} />
                    <span>انتظر لحظة، أنا أفكر حاليًا لأفضل إجابة لك فانا مساعدك من ريفيزا أكثر من سند لك</span>
                  </div>
                )}

                {/* Loading spinner for quiz generation */}
                {msg.type === 'loading-quiz' && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Loader2 className="animate-spin" size={20} />
                    <span>يتم إنشاء الاختبار...</span>
                  </div>
                )}

                 {/* Loading spinner for summary generation */}
                {msg.type === 'loading-summary' && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Loader2 className="animate-spin" size={20} />
                    <span>يتم تلخيص النص...</span>
                  </div>
                )}
                
                {/* Loading spinner for study plan generation */}
                {msg.type === 'loading-study-plan' && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Loader2 className="animate-spin" size={20} />
                    <span>يتم إنشاء الخطة الدراسية...</span>
                  </div>
                )}

                {/* Action buttons, displayed conditionally based on message content */}
                {msg.sender === 'ai' && msg.type === undefined && (
                  <div className="mt-2 text-right flex flex-wrap gap-2">
                    {/* Show "Quiz" button if message is long enough for a quiz */}
                    {msg.text.split(' ').length > 20 && (
                      <button
                        onClick={() => handleGenerateQuiz(msg.text)}
                        className={`flex items-center gap-1 text-xs text-white p-1 rounded-full transition-colors ${
                          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={isLoading}
                      >
                        <Lightbulb size={16} />
                        انشاء اختبار
                      </button>
                    )}
                    {/* Show "Summary" button if message is long enough for a summary */}
                    {msg.text.split(' ').length > 50 && (
                      <button
                        onClick={() => handleGenerateSummary(msg.text)}
                        className={`flex items-center gap-1 text-xs text-white p-1 rounded-full transition-colors ${
                          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={isLoading}
                      >
                        <ClipboardList size={16} />
                        تلخيص
                      </button>
                    )}
                    {/* Show "Study Plan" button if message contains planning keywords */}
                    {(msg.text.includes('خطوات') || msg.text.includes('نصائح') || msg.text.includes('استراتيجيات') || msg.text.includes('كيفية')) && (
                      <button
                        onClick={() => handleGenerateStudyPlan(msg.text)}
                        className={`flex items-center gap-1 text-xs text-white p-1 rounded-full transition-colors ${
                          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={isLoading}
                      >
                        <ListTodo size={16} />
                        خطة دراسية
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {/* Error message display section */}
        {error && (
          <div className="flex justify-center">
            <div className="p-3 max-w-[80%] rounded-2xl shadow-sm bg-red-100 text-red-800 flex items-center gap-2" dir="rtl">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area section */}
      <div className="p-2 sm:p-4 bg-white dark:bg-gray-800 shadow-lg flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage();
              }
            }}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="اكتب رسالتك هنا..."
            disabled={isLoading}
            dir="rtl"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || input.trim() === ''}
            className={`p-3 rounded-full text-white transition-all duration-300 ${
              isLoading || input.trim() === '' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Send size={24} />
            )}
          </button>
        </div>
        {/* Disclaimer message below the input field */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center" dir="rtl">
          قد يعرض Revisa معلومات خاطئة، لذا ننصحك بالتحقّق من ردوده.
        </p>
      </div>
    </div>
  );
};

export default AIChatPage;
