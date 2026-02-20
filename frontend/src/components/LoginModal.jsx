import { useState } from 'react';
import { authService } from '../services/appwriteAuth';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      const user = await authService.getUser();
      onSuccess(user);
      onClose();
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err?.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#120726]/80 p-5 backdrop-blur-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Login</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 outline-none"
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl bg-white/10 px-4 py-2">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-xl bg-white px-4 py-2 font-semibold text-black disabled:opacity-60">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
