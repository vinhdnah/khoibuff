import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import {
  Code2,
  Key,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Terminal,
  Send,
  CheckCircle2,
} from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { success, error } = useToast();

  const [showKey, setShowKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'status' | 'services' | 'balance'>('order');
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python'>('curl');

  const apiKey = user?.api_key || 'smm_live_demo_key_abcdef123456';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    success(`Đã sao chép ${label}!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!user) return;
    if (!window.confirm('Bạn có chắc chắn muốn tạo mới API Key? API Key cũ sẽ lập tức vô hiệu hóa.')) return;

    setIsRegenerating(true);
    try {
      const newKey = await authService.regenerateApiKey(user.id);
      setUser({ ...user, api_key: newKey });
      success('Tạo mới API Key thành công!');
    } catch (err: any) {
      error(err.message || 'Không thể tạo mới API Key');
    } finally {
      setIsRegenerating(false);
    }
  };

  const getCodeSnippet = () => {
    switch (activeTab) {
      case 'order': {
        if (activeLang === 'curl') {
          return `curl -X POST https://smmpro.vn/api/v1/order \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "TT_LIKE_VN",
    "link": "https://www.tiktok.com/@username/video/739182391283",
    "quantity": 1000
  }'`;
        }
        if (activeLang === 'js') {
          return `const response = await fetch('https://smmpro.vn/api/v1/order', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    service: 'TT_LIKE_VN',
    link: 'https://www.tiktok.com/@username/video/739182391283',
    quantity: 1000
  })
});

const data = await response.json();
console.log(data);`;
        }
        return `import requests

url = "https://smmpro.vn/api/v1/order"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "service": "TT_LIKE_VN",
    "link": "https://www.tiktok.com/@username/video/739182391283",
    "quantity": 1000
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
      }

      case 'status': {
        if (activeLang === 'curl') {
          return `curl -X POST https://smmpro.vn/api/v1/status \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{ "order_id": "ORD_12345678" }'`;
        }
        if (activeLang === 'js') {
          return `const response = await fetch('https://smmpro.vn/api/v1/status', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ order_id: 'ORD_12345678' })
});
const data = await response.json();
console.log(data);`;
        }
        return `import requests

response = requests.post(
    "https://smmpro.vn/api/v1/status",
    json={"order_id": "ORD_12345678"},
    headers={"Authorization": "Bearer ${apiKey}"}
)
print(response.json())`;
      }

      case 'services': {
        if (activeLang === 'curl') {
          return `curl -X GET https://smmpro.vn/api/v1/services \\
  -H "Authorization: Bearer ${apiKey}"`;
        }
        if (activeLang === 'js') {
          return `const response = await fetch('https://smmpro.vn/api/v1/services', {
  headers: { 'Authorization': 'Bearer ${apiKey}' }
});
const services = await response.json();`;
        }
        return `import requests

response = requests.get(
    "https://smmpro.vn/api/v1/services",
    headers={"Authorization": "Bearer ${apiKey}"}
)
print(response.json())`;
      }

      case 'balance': {
        if (activeLang === 'curl') {
          return `curl -X GET https://smmpro.vn/api/v1/balance \\
  -H "Authorization: Bearer ${apiKey}"`;
        }
        if (activeLang === 'js') {
          return `const response = await fetch('https://smmpro.vn/api/v1/balance', {
  headers: { 'Authorization': 'Bearer ${apiKey}' }
});
const balance = await response.json();`;
        }
        return `import requests

response = requests.get(
    "https://smmpro.vn/api/v1/balance",
    headers={"Authorization": "Bearer ${apiKey}"}
)
print(response.json())`;
      }
    }
  };

  const getResponseExample = () => {
    switch (activeTab) {
      case 'order':
        return `{\n  "success": true,\n  "order_id": "ORD_89A2BF1C_1740742910",\n  "total_amount": 30000,\n  "balance_after": 220000,\n  "status": "processing"\n}`;
      case 'status':
        return `{\n  "success": true,\n  "order_id": "ORD_89A2BF1C_1740742910",\n  "status": "completed",\n  "start_count": 350,\n  "current_count": 1350,\n  "remains": 0,\n  "progress_percentage": 100\n}`;
      case 'services':
        return `[\n  {\n    "service_code": "TT_LIKE_VN",\n    "name": "Tim Việt (Không tụt)",\n    "rate": 30000,\n    "min": 100,\n    "max": 200000,\n    "category": "Tim / Like"\n  }\n]`;
      case 'balance':
        return `{\n  "success": true,\n  "balance": 250000,\n  "currency": "VND"\n}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary-light" /> Tích Hợp API SMM Chuẩn
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Kết nối trực tiếp website hoặc bot tự động của bạn với hệ thống SMM PRO thông qua RESTful API tốc độ cao.
        </p>
      </div>

      {/* API Key Management Box */}
      <div className="p-6 rounded-2xl bg-surface/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Khóa Xác Thực API (API Key)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bảo mật API Key của bạn. Tuyệt đối không chia sẻ mã này ở các kênh công khai.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateKey}
            isLoading={isRegenerating}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Tạo Lại API Key
          </Button>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 font-mono text-xs text-slate-200">
          <div className="flex-1 truncate">
            {showKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••••••••••'}
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title={showKey ? 'Ẩn API Key' : 'Hiện API Key'}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleCopy(apiKey, 'API Key')}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Sao chép API Key"
          >
            {copiedCode === 'API Key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* API Endpoint Documentation & Interactive Sandbox */}
      <div className="p-6 rounded-2xl bg-surface/90 border border-slate-800 space-y-6">
        {/* Endpoint Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'order', label: 'Tạo đơn hàng (Order)', method: 'POST' },
            { id: 'status', label: 'Tra cứu trạng thái (Status)', method: 'POST' },
            { id: 'services', label: 'Danh sách dịch vụ (Services)', method: 'GET' },
            { id: 'balance', label: 'Kiểm tra số dư (Balance)', method: 'GET' },
          ].map((ep) => (
            <button
              key={ep.id}
              onClick={() => setActiveTab(ep.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === ep.id
                  ? 'bg-primary/20 text-primary-light border-primary/50 shadow-glow-primary'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {ep.method}
              </span>
              <span>{ep.label}</span>
            </button>
          ))}
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-300">Ví Dụ Code Mẫu</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-semibold">
              <button
                onClick={() => setActiveLang('curl')}
                className={`px-2.5 py-1 rounded ${activeLang === 'curl' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveLang('js')}
                className={`px-2.5 py-1 rounded ${activeLang === 'js' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setActiveLang('python')}
                className={`px-2.5 py-1 rounded ${activeLang === 'python' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Python
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-x-auto">
            <button
              onClick={() => handleCopy(getCodeSnippet(), 'Code Mẫu')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700"
              title="Sao chép code"
            >
              {copiedCode === 'Code Mẫu' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre>{getCodeSnippet()}</pre>
          </div>
        </div>

        {/* Response Example */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300">Phản Hồi Trả Về (JSON Response)</span>
          <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
            <pre>{getResponseExample()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
