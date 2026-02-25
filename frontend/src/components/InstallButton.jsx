import { usePWAInstall } from '../hooks/usePWAInstall';

/**
 * Install App Button Component
 * Shows a button to install the PWA when available
 */
const InstallButton = ({ variant = 'default' }) => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  // Don't render if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleClick = async () => {
    const success = await installApp();
    if (success) {
      console.log('App installed successfully!');
    }
  };

  // Different button styles based on variant
  const getButtonClass = () => {
    switch (variant) {
      case 'hero':
        return 'btn primary install-btn-hero';
      case 'navbar':
        return 'btn ghost install-btn-navbar';
      case 'banner':
        return 'install-btn-banner';
      default:
        return 'btn primary install-btn';
    }
  };

  if (variant === 'banner') {
    return (
      <div className="install-banner">
        <div className="install-banner-content">
          <div className="install-banner-icon">📱</div>
          <div className="install-banner-text">
            <strong>Install QueueEase</strong>
            <span>Add to home screen for quick access</span>
          </div>
        </div>
        <button onClick={handleClick} className="btn primary btn-sm">
          Install
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleClick} className={getButtonClass()}>
      <span className="install-icon">📲</span>
      <span>Install App</span>
    </button>
  );
};

export default InstallButton;
