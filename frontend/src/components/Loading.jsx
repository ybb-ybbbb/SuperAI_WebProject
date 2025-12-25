const Loading = ({ size = 'medium', text = '加载中...', fullScreen = false }) => {
  // 定义不同尺寸的样式
  const sizeStyles = {
    small: {
      iconSize: '1.5rem',
      fontSize: 'var(--font-size-sm)',
      padding: 'var(--spacing-3)'
    },
    medium: {
      iconSize: '2.5rem',
      fontSize: 'var(--font-size-base)',
      padding: 'var(--spacing-4)'
    },
    large: {
      iconSize: '3.5rem',
      fontSize: 'var(--font-size-lg)',
      padding: 'var(--spacing-6)'
    }
  };

  const styles = sizeStyles[size] || sizeStyles.medium;

  if (fullScreen) {
    return (
      <div className="loading-container-fullscreen">
        <div className="loading-content">
          <div className="loading-spinner" style={{ fontSize: styles.iconSize }}>
            ⏳
          </div>
          {text && <p className="loading-text" style={{ fontSize: styles.fontSize }}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container" style={{ padding: styles.padding }}>
      <div className="loading-content">
        <div className="loading-spinner" style={{ fontSize: styles.iconSize }}>
          ⏳
        </div>
        {text && <p className="loading-text" style={{ fontSize: styles.fontSize }}>{text}</p>}
      </div>
    </div>
  );
};

export default Loading;