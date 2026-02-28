import React, { useState, useRef, useEffect, useMemo } from 'react';
import './PropsTableWrapper.css';

const PropsTableWrapper = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState({});
  const [columnWidths, setColumnWidths] = useState({
    propName: 200,
    type: 120,
    propValue: 300,
  });

  const wrapperRef = useRef(null);
  const overlayRef = useRef(null);

  // ✅ Only rely on actual props passed
  const props = children?.props || {};

  const allProps = useMemo(() => Object.keys(props), [props]);

  const getType = (value) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  };

  const toggleCollapse = (path) => {
    setCollapsedKeys((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleMouseDown = (e, columnKey) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnKey];

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(80, startWidth + (moveEvent.clientX - startX));
      setColumnWidths((prev) => ({ ...prev, [columnKey]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const renderValue = (value, path = '', depth = 0) => {
    const isObject = typeof value === 'object' && value !== null;
    const isArray = Array.isArray(value);
    const isCollapsed =
      collapsedKeys[path] === undefined ? true : collapsedKeys[path];

    if (isObject) {
      const keys = isArray ? value : Object.keys(value);

      return (
        <div style={{ paddingLeft: `${depth * 16}px`, fontFamily: 'monospace' }}>
          <div
            className="accordion-header"
            onClick={() => toggleCollapse(path)}
            style={{ cursor: 'pointer' }}
          >
            {isCollapsed ? '▶' : '▼'}{' '}
            {isArray ? `Array(${value.length})` : `Object(${keys.length})`}
          </div>

          {!isCollapsed && (
            <div className="accordion-content">
              {isArray
                ? value.map((item, index) => (
                    <div key={`${path}-${index}`}>
                      <strong>{index}:</strong>{' '}
                      {renderValue(item, `${path}[${index}]`, depth + 1)}
                    </div>
                  ))
                : Object.entries(value).map(([k, v]) => (
                    <div key={`${path}-${k}`}>
                      <strong>{k}:</strong>{' '}
                      {renderValue(v, `${path}.${k}`, depth + 1)}
                    </div>
                  ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <span className="console-value">
        {typeof value === 'string' ? `"${value}"` : String(value)}
      </span>
    );
  };

  // Close overlay on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target) &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  return (
    <div ref={wrapperRef} className="wrapper">
      <div
        onClick={() => setIsVisible((prev) => !prev)}
        className={`pi-button ${isVisible ? 'pi-button-active' : ''}`}
      >
        PI
      </div>

      {isVisible && (
        <div ref={overlayRef} className="overlay">
          <h4 className="props-inspector-title">Props Inspector</h4>

          <table className="table">
            <thead>
              <tr>
                {['propName', 'type', 'propValue'].map((col) => (
                  <th
                    key={col}
                    style={{
                      width: columnWidths[col],
                      position: 'relative',
                    }}
                  >
                    {col === 'propName'
                      ? 'Prop Name'
                      : col === 'type'
                      ? 'Type'
                      : 'Prop Value'}

                    <div
                      className="resizer"
                      onMouseDown={(e) => handleMouseDown(e, col)}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {allProps.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: 12 }}>
                    No props passed
                  </td>
                </tr>
              ) : (
                allProps.map((key) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{getType(props[key])}</td>
                    <td>{renderValue(props[key], key)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {children}
    </div>
  );
};

export default PropsTableWrapper;