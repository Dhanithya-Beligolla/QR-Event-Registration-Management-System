import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext({ addToast: ()=>{} });

export function useToaster(){
  return useContext(ToastContext);
}

let idSeq = 1;
export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id)=>{
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((text, variant='success', timeout=3000)=>{
    const id = idSeq++;
    setToasts(ts => [...ts, { id, text, variant }]);
    if (timeout > 0) setTimeout(()=> remove(id), timeout);
  }, [remove]);

  const value = useMemo(()=>({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map(t=> (
          <div key={t.id} className={`toast ${t.variant}`}
               onClick={()=>remove(t.id)}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
