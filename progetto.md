# LeetCode Tracker - Documentazione Progetto e Problema Performance

## 📋 **Panoramica Progetto**

**Nome**: LeetCode Tracker  
**URL Live**: https://dozydev.com  
**Repository**: GitHub (collegato a Vercel per auto-deploy)  
**Scopo**: Applicazione web personale per tracciare esercizi LeetCode risolti con sistema di streak

## 🛠️ **Stack Tecnologico**

- **Frontend**: Next.js 14.2.30 (App Router)
- **Styling**: TailwindCSS  
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL serverless)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (piano gratuito)
- **Domain**: dozydev.com (collegato tramite DNS)

## 🗄️ **Schema Database (Supabase)**

### Tabella `profiles`
```sql
- id: string (PK, matches auth.users.id)
- name: string | null
- streak_count: number | null
- last_completed_date: string | null  
- created_at: string
- updated_at: string
```

### Tabella `problems`
```sql
- id: number (PK, auto-increment)
- leetcode_number: number (unique)
- title: string
- link: string
- created_at: string
- updated_at: string
```

### Tabella `solved_exercises`
```sql
- id: number (PK, auto-increment)
- user_id: string (FK → profiles.id)
- problem_id: number (FK → problems.id)
- notes: string | null
- date_completed: string
- created_at: string
- updated_at: string
```

## 🚀 **Funzionalità Implementate**

### ✅ **Autenticazione**
- Login/Register con Supabase Auth
- Session management con AuthContext
- Route protection con HOC `withAuth`
- Middleware Next.js per refresh token

### ✅ **Dashboard Profilo**
- **Statistiche**: Conteggio esercizi risolti e streak corrente
- **Tabella paginata**: 10 esercizi per pagina, ordinati per data completamento
- **CRUD Esercizi**: Add/Edit/Delete con modali
- **Sistema Streak**: Calcolo automatico basato su date consecutive

### ✅ **Gestione Esercizi**
- **Add Modal**: Numero LeetCode, titolo, link, note, data completamento
- **Edit Modal**: Modifica di tutti i campi
- **Delete Modal**: Conferma eliminazione
- **Validazione**: Controllo duplicati, creazione automatica problem se non esiste

### ✅ **Sistema Streak**
- **Auto-calcolo**: Streak incrementa per giorni consecutivi
- **Update real-time**: Aggiornamento immediato UI dopo add/edit
- **Reset logico**: Streak riparte da 1 se gap > 1 giorno

## ❌ **PROBLEMA PRINCIPALE: Performance Estrema Lentezza**

### 🐌 **Sintomi**
- **Login → Profilo**: 4-5 secondi di caricamento
- **Caricamento tabella esercizi**: 2-3 secondi aggiuntivi
- **Esperienza utente**: Inaccettabile lentezza

### 🔍 **Analisi Diagnostica Completata**

#### **Browser DevTools Analysis**
- **Network Tab**: Query Supabase veloci (200-250ms)
- **Console Logs**: `loadProfile ERROR - Tempo: 5002ms` (timeout)
- **Richieste HTTP**: 29 requests totali (troppi per pagina semplice)

#### **Log Diagnostici Aggiunti**
```javascript
// AuthContext.tsx - loadProfile function
⏱️ loadProfile START - userId: 884a8877-3ae9-4d16-9d95-467cdf96fdda
🔍 Creating queryPromise...
🔍 Creating timeoutPromise...  
🔍 Starting Promise.race...
🔍 Promise.race completed (a volte)
Errore nel caricamento del profilo: Error: Query timeout
```

#### **Pattern Identificati**
1. **Loop infinito**: `loadProfile` chiamato multiple volte consecutivamente
2. **Timeout protettivo**: 5 secondi di timeout salvano da crash completo
3. **Re-rendering eccessivi**: Componenti si re-renderizzano troppo spesso

## 🔧 **Tentativi di Risoluzione (FALLITI)**

### ❌ **Tentativo 1: Rimozione Timeout**
```javascript
// PRIMA (con timeout)
const result = await Promise.race([queryPromise, timeoutPromise])

// DOPO (senza timeout) 
const { data, error } = await supabase.from('profiles')...
```
**Risultato**: Loop infinito totale, applicazione bloccata permanentemente

### ❌ **Tentativo 2: Ottimizzazione Query Supabase**
```javascript
// Query ottimizzata
{ count: 'estimated' } // invece di 'exact'
select('problems!inner(leetcode_number, title, link)') // invece di *
```
**Risultato**: Applicazione non caricava più nessun componente

### ❌ **Tentativo 3: Memoizzazione Client**
```javascript  
const supabase = useMemo(() => createSupabaseClient(), [])
```
**Risultato**: Stesso problema di performance

### ❌ **Tentativo 4: Fix useEffect Dependencies**
```javascript
// PRIMA
}, [supabase.auth, loadProfile]) // loadProfile causava loop

// DOPO  
}, [supabase.auth]) // rimosso loadProfile
```
**Risultato**: Problema persiste, ancora timeout errors

## 📁 **Struttura Codice Rilevante**

### **src/contexts/AuthContext.tsx**
- **AuthProvider**: Gestisce stato utente globale
- **loadProfile**: Funzione problematica con timeout
- **useEffect**: Contiene loop di re-rendering

### **src/app/profile/page.tsx** 
- **loadExercises**: Query JOIN per esercizi + problemi
- **Paginazione**: 10 items per pagina
- **State management**: Multiple useState per modali

### **src/lib/supabase/**
- **client.ts**: Browser client 
- **server.ts**: Server client + Service client
- **index.ts**: Barrel exports

### **middleware.ts**
- Refresh automatico sessioni Supabase
- Cookie management per auth

## 🎯 **Problema Attuale (Stato Finale)**

### **Codice Funzionante Ma Lento**
- ✅ **Applicazione funziona** correttamente
- ✅ **Tutte le feature** operative  
- ❌ **Performance inaccettabile** (4-5 secondi)
- ❌ **Timeout errors** ricorrenti in console

### **Console Error Corrente**
```
AuthContext.tsx:68 Errore nel caricamento del profilo: Error: Query timeout
    at eval (AuthContext.tsx:53:41)
```

### **Ipotesi Non Testate**
1. **Problema RLS (Row Level Security)** Supabase
2. **Network latency** geografica con Supabase  
3. **Problema configurazione** Supabase client
4. **Race condition** nel session management
5. **Database query** inefficienti (JOIN complessi)

## 🚨 **Requisiti per Risoluzione**

1. **Performance target**: Login → Profilo in <2 secondi
2. **Stabilità**: Zero timeout errors
3. **Backward compatibility**: Mantenere tutte le funzionalità
4. **Testing approach**: Modifiche graduali testabili in locale
5. **Fallback strategy**: Rollback rapido se modifiche rompono app

## 📊 **Metriche Attuali vs Target**

| Operazione | Attuale | Target | Status |
|------------|---------|---------|--------|
| Login → Profilo | 4-5s | <2s | ❌ |
| Load Exercises | 2-3s | <1s | ❌ |  
| Add Exercise | Istantaneo | <500ms | ✅ |
| Streak Update | Istantaneo | <500ms | ✅ |

## 🔧 **Setup Sviluppo**

```bash
# Clone e setup
git clone [repo]
npm install
npm run dev # localhost:3000

# Environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx  
SUPABASE_SERVICE_ROLE_KEY=xxx

# Deploy
git push # Auto-deploy su dozydev.com via Vercel
```

## 🎯 **Obiettivo Immediato**

**Identificare e risolvere la causa root** del timeout in `loadProfile` mantenendo:
- ✅ Funzionalità esistenti intatte
- ✅ Sistema di streak operativo  
- ✅ Stabilità dell'applicazione
- ⚡ Performance accettabile (<2s caricamento totale)

---

**Status**: PROBLEMA IRRISOLTO - Richiede analisi approfondita e approccio diverso 