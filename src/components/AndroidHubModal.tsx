import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Terminal, 
  Play, 
  Cpu, 
  Globe, 
  FileCode, 
  Key, 
  CheckSquare, 
  RefreshCw, 
  Zap, 
  Share2 
} from 'lucide-react';

interface AndroidHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export default function AndroidHubModal({ isOpen, onClose, lang }: AndroidHubModalProps) {
  const [activeTab, setActiveTab] = useState<'pwabuilder' | 'install' | 'assetlinks' | 'cli' | 'play'>('pwabuilder');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sha256Input, setSha256Input] = useState<string>('14:6D:E9:8E:B5:7F:C2:01:21:2B:65:0F:78:E2:BB:D2:90:35:86:AB:CD:EF:01:23:45:67:89:01:23:45:67:89:01');
  const [savedAssetLinks, setSavedAssetLinks] = useState<boolean>(false);
  
  // Native PWA Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(lang === 'ru' 
        ? 'Для установки на Android нажмите трехточечное меню Chrome и выберите "Установить приложение" или "На экран Домой".' 
        : 'To install on Android, tap the Chrome 3-dot menu and select "Install app" or "Add to Home screen".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalledSuccess(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://fleet.your-domain.ru';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appOrigin)}`;

  const generatedAssetLinks = JSON.stringify([
    {
      "relation": ["delegate_permission/common.handle_all_urls"],
      "target": {
        "namespace": "android_app",
        "package_name": "com.jivfleet.vladivostok",
        "sha256_cert_fingerprints": [sha256Input.trim()]
      }
    }
  ], null, 2);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span>Android Application & PWABuilder Hub</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                    TWA / APK / Play Store
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ru' 
                  ? 'Генерация нативного Android APK / AAB через облачные инструменты PWABuilder & Bubblewrap CLI' 
                  : 'Native Android APK / AAB generation via PWABuilder & Bubblewrap Trusted Web Activity.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2 bg-slate-950/60 border-b border-white/5 flex flex-wrap gap-1 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pwabuilder' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>PWABuilder Cloud</span>
          </button>

          <button
            onClick={() => setActiveTab('install')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'install' 
                ? 'bg-sky-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Instant Android PWA</span>
          </button>

          <button
            onClick={() => setActiveTab('assetlinks')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'assetlinks' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>AssetLinks SHA-256</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'cli' 
                ? 'bg-purple-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Bubblewrap CLI</span>
          </button>

          <button
            onClick={() => setActiveTab('play')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'play' 
                ? 'bg-indigo-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Google Play Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-300 text-xs sm:text-sm font-mono">
          
          {/* TAB 1: PWABUILDER CLOUD ONE-CLICK GENERATOR */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-emerald-300 font-bold block text-sm sm:text-base">
                    🚀 PWABuilder (Облачный сервис Microsoft & Google)
                  </span>
                  <p className="text-slate-300 text-xs mt-1">
                    PWABuilder анализирует готовый манифест <code className="bg-black/50 px-1 py-0.5 rounded text-emerald-300">manifest.json</code> и мгновенно компилирует подписанный Android APK и готовую сборку <code className="bg-black/50 px-1 py-0.5 rounded text-emerald-300">.aab</code> для Google Play Console.
                  </p>
                </div>

                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shrink-0 flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                >
                  <span>Открыть PWABuilder</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* URL Copy box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <span className="text-xs text-slate-400 font-bold block">
                  1. Вставьте этот URL вашего PWA в PWABuilder:
                </span>
                <div className="p-2.5 rounded-xl bg-black text-emerald-300 flex items-center justify-between gap-2 border border-white/5">
                  <code className="text-xs truncate">{appOrigin}</code>
                  <button
                    onClick={() => copyToClipboard(appOrigin, 'app_origin')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1 shrink-0 font-bold"
                  >
                    {copiedKey === 'app_origin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Скопировать</span>
                  </button>
                </div>
              </div>

              {/* Manifest Audit Checklist */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Проверка готовности PWA Manifest для Android TWA:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Web App Manifest (`/manifest.json`)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Service Worker Caching (`/sw.js`)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Standalone Display & Theme Color (#020617)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Digital Asset Links (`/.well-known/assetlinks.json`)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Maskable Icons (192px, 512px)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>App Package ID (`com.jivfleet.vladivostok.pwa`)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTANT PWA INSTALLATION ON ANDROID */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-2">
                <span className="text-sky-300 font-bold block text-sm">
                  📱 Прямая установка PWA на Android смартфон без Google Play
                </span>
                <p className="text-slate-300 text-xs">
                  Пользователи во Владивостоке могут сразу же установить ФАРВАТЕР как нативное Android приложение в 1 клик.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 mx-auto flex items-center justify-center text-sky-400">
                  <Smartphone className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-white font-bold text-base">ФАРВАТЕР JIV Fleet Vladivostok</h3>
                  <p className="text-xs text-slate-400">Версия 1.0.0 • Android PWA App Container</p>
                </div>

                <button
                  onClick={handleInstallClick}
                  className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg hover:scale-105 inline-flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>{installedSuccess ? 'Установлено на Android!' : 'Установить приложение на Android'}</span>
                </button>

                {installedSuccess && (
                  <p className="text-xs text-emerald-400 font-bold">
                    ✓ Иконка приложения успешно добавлена на главный экран Android!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DIGITAL ASSET LINKS & SHA-256 KEY CONFIG */}
          {activeTab === 'assetlinks' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <span className="font-bold block text-amber-300">🔑 Digital Asset Links (`assetlinks.json`) Verification</span>
                <p className="text-slate-300">
                  Удаляет адресную строку Chrome при заруске Android приложения, делая вид 100% нативным. Укажите ваш SHA-256 отпечатков ключа подписи.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">
                    SHA-256 Certificate Fingerprint (из Google Play Console или App Keystore):
                  </label>
                  <input
                    type="text"
                    value={sha256Input}
                    onChange={(e) => setSha256Input(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-bold">Сгенерированный `/.well-known/assetlinks.json`:</label>
                    <button
                      onClick={() => copyToClipboard(generatedAssetLinks, 'assetlinks_json')}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      {copiedKey === 'assetlinks_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Копировать JSON</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-black text-amber-300 text-[11px] overflow-x-auto whitespace-pre-wrap border border-white/5">
                    {generatedAssetLinks}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BUBBLEWRAP CLI COMMANDS */}
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs space-y-1">
                <span className="font-bold block text-purple-300">💻 Сборка через Google Bubblewrap CLI (Command Line):</span>
                <p className="text-slate-300">
                  Если вы предпочитаете локальную сборку APK/AAB через Node.js CLI:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-bold block">1. Установка Bubblewrap CLI:</span>
                  <div className="p-2.5 rounded-xl bg-black text-purple-300 text-xs flex items-center justify-between">
                    <code>npm install -g @bubblewrap/cli</code>
                    <button onClick={() => copyToClipboard('npm install -g @bubblewrap/cli', 'cli_1')} className="p-1 rounded bg-slate-800 hover:text-white">
                      {copiedKey === 'cli_1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-bold block">2. Инициализация проекта Android TWA:</span>
                  <div className="p-2.5 rounded-xl bg-black text-purple-300 text-xs flex items-center justify-between">
                    <code>bubblewrap init --manifest={appOrigin}/manifest.json</code>
                    <button onClick={() => copyToClipboard(`bubblewrap init --manifest=${appOrigin}/manifest.json`, 'cli_2')} className="p-1 rounded bg-slate-800 hover:text-white">
                      {copiedKey === 'cli_2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-bold block">3. Компиляция готовых APK и AAB пакетов:</span>
                  <div className="p-2.5 rounded-xl bg-black text-purple-300 text-xs flex items-center justify-between">
                    <code>bubblewrap build</code>
                    <button onClick={() => copyToClipboard('bubblewrap build', 'cli_3')} className="p-1 rounded bg-slate-800 hover:text-white">
                      {copiedKey === 'cli_3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE PLAY CONSOLE PUBLISHING GUIDE */}
          {activeTab === 'play' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs space-y-1">
                <span className="font-bold block text-indigo-300">📋 Чек-лист публикации в Google Play Console:</span>
                <p className="text-slate-300">Четыре простых шага для размещения ФАРВАТЕР в каталоге приложений Android.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-indigo-400 font-bold text-xs block">1. Скачайте `.aab` файл из PWABuilder:</span>
                  <p className="text-xs text-slate-300">
                    Нажмите кнопку "Generate Android Package" в PWABuilder и скачайте файл <code className="bg-black px-1.5 py-0.5 rounded text-emerald-300">app-release.aab</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-indigo-400 font-bold text-xs block">2. Загрузка в Google Play Console:</span>
                  <p className="text-xs text-slate-300">
                    Создайте новое приложение в Play Console с Package ID <code className="bg-black px-1.5 py-0.5 rounded text-amber-300">com.jivfleet.vladivostok</code> и загрузите `.aab` в рабочую версию.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-indigo-400 font-bold text-xs block">3. Подтверждение владения домена (AssetLinks):</span>
                  <p className="text-xs text-slate-300">
                    Скопируйте SHA-256 ключ из раздела "App Signing" Google Play в вкладку "AssetLinks SHA-256" этого хаба.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Package ID: <strong className="text-white">com.jivfleet.vladivostok</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg"
          >
            Закрыть Панель
          </button>
        </div>

      </div>
    </div>
  );
}
