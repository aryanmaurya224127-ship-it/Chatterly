import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from './Login';
export default function Register(){
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const {authenticate}=useAuth();
  const nav=useNavigate();
  const submit=async e=>{e.preventDefault();setBusy(true);
    setError('');
    try{await authenticate('register',{name,email,password});
    nav('/');
    
  }catch(err){setError(err.response?.data?.message||'Unable to create account');  
    }
    finally{setBusy(false);
    }};
    return <AuthShell eyebrow="YOUR SPACE STARTS HERE" title="Make yourself at home." subtitle="Create an account and bring your conversations together."><form onSubmit={submit} className="auth-form"><label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="How should we call you?" required maxLength={60}/></label><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required/></label>{error&&<p className="form-error">{error}</p>}<button className="primary-btn" disabled={busy}>{busy?'Creating account...':'Create account →'}</button></form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></AuthShell>}
