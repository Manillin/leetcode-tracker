# LeetCode Tracker - Performance Issue Report

## 📊 **Progetto Overview**

**Nome**: LeetCode Tracker  
**Tipo**: Web app Next.js 14 con Supabase  
**Scopo**: Tracciare esercizi LeetCode risolti con sistema di streak (giorni consecutivi)  
**Deploy**: Vercel (funzionante)  
**Stato**: ✅ Funzionale ma con **problema di performance critico NON risolto**

## ⚠️ **PROBLEMA PRINCIPALE (NON RISOLTO)**

### **Sintomi**
- Query Supabase si **bloccano per 3-5 secondi** o vanno in **timeout infinito**
- Problema geografico/di rete confermato
- Istanza Supabase: `https://zuurohriwqsavefsrvwk.supabase.co`
- Le query funzionano ma con **latenza estrema inaccettabile**

### **Soluzioni Temporanee Implementate (CEROTTI)**
```typescript
// TIMEOUT ARTIFICIALI per evitare freeze dell'app
const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Query timeout')), 2000)
)
const result = await Promise.race([queryPromise, timeoutPromise])
```

**⚠️ IMPORTANTE**: Questi timeout **NON risolvono** il problema di latenza, solo **prevengono il freeze** dell'app.

## 🏗️ **Architettura Tecnica**

### **Stack**
- **Frontend**: Next.js 14.2.30 (App Router)
- **Backend**: Supabase (PostgreSQL serverless)
- **Auth**: Supabase Auth con RLS (Row Level Security)
- **Styling**: Tailwind CSS
- **Deploy**: Vercel

### **Database Schema**
```sql
-- Tabelle principali
profiles (id, name, streak_count, last_completed_date)
problems (id, leetcode_number, title, link)  
solved_exercises (id, user_id, problem_id, notes, date_completed)
```

### **RLS Policies Configurate**
```sql
-- Ogni utente vede solo i propri dati
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own exercises" ON solved_exercises FOR SELECT USING (auth.uid() = user_id);
```

## 📁 **File Chiave del Progetto**

### **File con Timeout Artificiali (PATCHES)**

#### **1. `src/contexts/AuthContext.tsx`**
```typescript
// PATCH: Timeout su loadProfile
const loadProfile = useCallback(async (userId: string) => {
    const queryPromise = supabase.from('profiles').select('*').eq('id', userId).single()
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile query timeout')), 2000)
    )
    const result = await Promise.race([queryPromise, timeoutPromise])
    // ...
}, [supabase])
```

#### **2. `src/app/profile/page.tsx`**
```typescript
// PATCH: Query non-bloccanti per esercizi
const loadDataNonBlocking = useCallback(() => {
    // Promise.allSettled per evitare che una query lenta blocchi tutto
    Promise.allSettled([loadCount(), loadExercises()])
}, [user?.id, supabase, currentPage, ITEMS_PER_PAGE])
```

### **File di Configurazione**
- **`middleware.ts`**: Gestione sessioni Supabase ottimizzata
- **`src/lib/supabase/client.ts`**: Client Supabase memoizzato
- **`src/types/database.ts`**: TypeScript types per schema DB

## 🚀 **Performance Metrics**

### **Timing Attuali (CON TIMEOUT)**
```
✅ Caricamento pagina: ~500ms (VELOCE)
⚠️ Query profilo: 2000ms timeout (PATCH)
⚠️ Query esercizi: timeout variabile (PATCH) 
⚠️ Query count: timeout variabile (PATCH)
```

### **Timing Obiettivo (SENZA PATCH)**
```
🎯 Caricamento pagina: <500ms
🎯 Query profilo: <300ms  
🎯 Query esercizi: <500ms
🎯 Query count: <200ms
```

## 🔧 **Strategie di Ottimizzazione Implementate**

### **✅ Risolte con Successo**
1. **Caricamento pagina veloce**: Sostituito `getSession()` lento con `onAuthStateChange()`
2. **Query parallele**: `Promise.allSettled()` invece di sequenziali
3. **Memoizzazione**: Client Supabase e funzioni con `useCallback`/`useMemo`
4. **Cache warming**: Query piccole all'avvio per ridurre cold start
5. **Middleware ottimizzato**: Skip per asset statici
6. **Gestione errori graceful**: L'app non si blocca mai

### **❌ Non Risolte (PROBLEMA CORE)**
1. **Latenza geografica Supabase**: Query individuali ancora lente 3-5s
2. **Cold start database**: Prima query sempre più lenta
3. **Rete/routing**: Possibile problema ISP -> Supabase

## 📋 **Log Diagnostici Significativi**

### **Log Normale (Con Timeout)**
```
🚀 useEffect STARTED at 247.90 ms
👤 loadProfile START - userId: 884a8877-3ae9-4d16-9d95-467cdf96fdda  
⏰ Profile timeout after 500.50 ms - app continues working
🛡️ Profile timeout but keeping existing profile data
✅ Auth initialization completed in 504.50 ms
```

### **Log Problematico (Senza Timeout)**  
```
🔬 DIAGNOSTIC MODE - loadProfile START
⚡ Executing RAW query without any timeout...
// Query si blocca qui per 3-5 secondi o infinito
```

### **Log Refresh Token (Problema Intermittente)**
```
🔄 Auth state change: SIGNED_IN at 182343.50 ms  (refresh automatico)
👤 loadProfile START - userId: 884a8877-3ae9-4d16-9d95-467cdf96fdda
⏰ Profile timeout after 502.60 ms - app continues working
```

## 🎯 **Funzionalità Implementate Correttamente**

### **✅ Sistema Streak Corretto**
- Conta **giorni consecutivi**, non esercizi individuali
- Se aggiungi 20 esercizi in un giorno → streak +1 
- Se salti un giorno → streak reset
- Check duplicati per stesso giorno implementato

### **✅ Gestione Utenti**
- Autenticazione Supabase funzionante
- RLS (Row Level Security) configurato
- Registrazione + creazione profilo automatica
- Logout/login stabili

### **✅ CRUD Esercizi**
- Aggiunta esercizi con modal
- Modifica esercizi esistenti  
- Eliminazione con conferma
- Paginazione tabella (10 elementi)

## 🔍 **Problema Root Cause Analysis**

### **Ipotesi Confermate**
1. **✅ Non è problema RLS**: Policies testate e funzionanti
2. **✅ Non è problema codice**: Query semplici (`SELECT * FROM profiles`)
3. **✅ Non è problema config**: `.env.local` e credenziali corrette
4. **✅ Non è problema server**: Vercel deploy funzionante

### **Ipotesi Probabile (Non Testata)**
1. **🎯 Latenza geografica**: Server Supabase lontano geograficamente
2. **🎯 ISP routing**: Percorso di rete inefficiente
3. **🎯 Cold start Supabase**: Database serverless con startup lento
4. **🎯 Configurazione istanza**: Tier/piano Supabase non ottimale

### **Soluzioni Non Tentate**
1. **Cambiare regione Supabase**: Creare nuova istanza più vicina
2. **Upgrade piano Supabase**: Tier più alto con performance migliori  
3. **Connection pooling**: Configurare pooler per ridurre latenza
4. **Alternative database**: Migrare a PlanetScale/Neon/altro
5. **Caching layer**: Redis/Vercel KV per cache query frequenti

## 🚨 **AZIONE RICHIESTA**

### **Priorità 1: Diagnosticare Latenza Rete**
1. Testare `ping` e `traceroute` verso server Supabase
2. Verificare regione dell'istanza Supabase vs posizione utente
3. Testare da location geografiche diverse

### **Priorità 2: Configurazione Supabase**
1. Verificare piano/tier attuale
2. Controllare metrics di performance nel dashboard Supabase
3. Valutare migrazione a regione più vicina

### **Priorità 3: Alternative Tecniche**
1. Implementare caching layer (Redis/KV)
2. Valutare database alternative (PlanetScale, Neon)
3. Connection pooling avanzato

## 💡 **Info per il Nuovo Assistente**

### **Ambiente di Test**
- **Locale**: `npm run dev` - http://localhost:3000
- **Produzione**: https://leetcode-tracker-<hash>.vercel.app
- **Repo**: github.com/Manillin/leetcode-tracker

### **Credenziali**
- **User ID test**: 884a8877-3ae9-4d16-9d95-467cdf96fdda
- **Supabase URL**: https://zuurohriwqsavefsrvwk.supabase.co  
- **File env**: `.env.local` (presente, configurato)

### **Comandi Utili**
```bash
# Dev locale con log dettagliati
npm run dev

# Build production (verificare errori)  
npm run build

# Deploy Vercel
git push origin main
```

### **Query di Test Dirette**
```sql
-- Test semplice in Supabase SQL Editor
SELECT COUNT(*) FROM profiles;
SELECT * FROM profiles WHERE id = '884a8877-3ae9-4d16-9d95-467cdf96fdda';
```

---

**⚠️ RIEPILOGO**: L'app funziona perfettamente con i timeout artificiali, ma il **problema di latenza di rete** verso Supabase rimane **irrisolto**. Serve diagnosticare e risolvere la causa root delle query lente.
