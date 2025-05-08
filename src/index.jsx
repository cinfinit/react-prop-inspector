import React, { useState, useRef, useEffect } from 'react';
import './PropsTableWrapper.css';

const PropsTableWrapper = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef(null);
  const overlayRef = useRef(null);
  const [collapsedKeys, setCollapsedKeys] = useState({});
  const [columnWidths, setColumnWidths] = useState({
    propName: 200,
    type: 100,
    propValue: 300,
  });

  const props = children.props || {};

  const potentialProps = [];
  if (children.type && children.type.length) {
    const componentStr = children.type.toString();
    const match = componentStr.match(/\(([^)]*)\)/);
    if (match && match[1]) {
      potentialProps.push(
        ...match[1]
          .split(',')
          .map((param) => param.trim().replace(/[{}]/g, ''))
          .map((param) => param.replace(/\s+/g, ''))
          .filter(Boolean)
      );
    }
  }

  const propEntries = Object.entries(props);
  const allProps = [
    ...new Set([...potentialProps, ...propEntries.map(([key]) => key)]),
  ];

  const getType = (value) => {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    return typeof value;
  };

  const toggleCollapse = (key) => {
    setCollapsedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleMouseDown = (e, columnKey) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnKey];

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      setColumnWidths((prev) => ({ ...prev, [columnKey]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const renderValue = (key, value, depth = 0) => {
    const isObject = typeof value === 'object' && value !== null;
    const isArray = Array.isArray(value);
    const isCollapsed =
      collapsedKeys[key] === undefined ? true : collapsedKeys[key];

    const toggle = () => toggleCollapse(key);

    if (isObject) {
      return (
        <div style={{ paddingLeft: `${depth * 20}px`, fontFamily: 'monospace' }}>
          <div className="accordion-header" onClick={toggle}>
            {isArray ? (
              <span>
                {isCollapsed ? '▶' : '▼'} {key}: [{value.length}]
              </span>
            ) : (
              <span>
                {isCollapsed ? '▶' : '▼'} {key}: {Object.keys(value).length}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <div className="accordion-content">
              {isArray
                ? value.map((item, index) => (
                    <div key={index}>
                      <strong>{index}:</strong>{' '}
                      {renderValue(`${key}[${index}]`, item, depth + 1)}
                    </div>
                  ))
                : Object.entries(value).map(([subKey, subValue], index) => (
                    <div key={index}>
                      <strong>{subKey}:</strong>{' '}
                      {renderValue(`${key}.${subKey}`, subValue, depth + 1)}
                    </div>
                  ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <span className="console-value">
          {typeof value === 'string' ? `"${value}"` : String(value)}
        </span>
      );
    }
  };

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
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  return (
    <div ref={wrapperRef} className="wrapper">
      <div
        onClick={() => setIsVisible(!isVisible)}
        className={`pi-button ${isVisible ? 'pi-button-active' : ''}`}
      >
        PI
      </div>

      {isVisible && (
        <div ref={overlayRef} className="overlay">
          <h4 className="props-inspector-title">Props Inspector</h4>
          <table className="table" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th
                  style={{
                    width: columnWidths.propName,
                    border: '1px solid #4A6D7C',
                    padding: '10px',
                    position: 'relative',
                  }}
                >
                  Prop Name
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '5px',
                      cursor: 'col-resize',
                      height: '100%',
                      backgroundColor: '#7F8C8D',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'propName')}
                  ></div>
                </th>

                <th
                  style={{
                    width: columnWidths.type,
                    border: '1px solid #4A6D7C',
                    padding: '10px',
                    position: 'relative',
                  }}
                >
                  Type
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '5px',
                      cursor: 'col-resize',
                      height: '100%',
                      backgroundColor: '#7F8C8D',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'type')}
                  ></div>
                </th>

                <th
                  style={{
                    width: columnWidths.propValue,
                    border: '1px solid #4A6D7C',
                    padding: '10px',
                    position: 'relative',
                  }}
                >
                  Prop Value
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '5px',
                      cursor: 'col-resize',
                      height: '100%',
                      backgroundColor: '#7F8C8D',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'propValue')}
                  ></div>
                </th>
              </tr>
            </thead>

            <tbody>
              {allProps.map((key) => (
                <tr key={key}>
                  <td style={{ border: '1px solid #4A6D7C', padding: '10px' }}>{key}</td>
                  <td style={{ border: '1px solid #4A6D7C', padding: '10px' }}>
                    {props[key] === undefined
                      ? 'undefined'
                      : getType(props[key])}
                  </td>
                  <td style={{ border: '1px solid #4A6D7C', padding: '10px' }}>
                    {renderValue(key, props[key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {children}
    </div>
  );
};

export default PropsTableWrapper;