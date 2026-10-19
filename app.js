import { db } from './cloud.js';
let currentUser=null;
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let reports = [];
let filesSelected = [];

async function loadReports(){const {data,error}=await db.from('reports').select('*').order('created_at',{ascending:false});if(error)throw error;reports=data.map(r=>({...r,created:r.created_at}));updateMetrics()}
function updateMetrics(){$("#metric-vistorias").textContent=reports.length;$("#metric-relatorios").textContent=reports.length;renderReports()}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3200)}
function showView(name){$$(".view").forEach(v=>v.classList.toggle("show",v.id==="view-"+name));$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));const titles={inicio:"Painel inicial",vistoria:"Novo parecer técnico",relatorios:"Relatórios e pareceres",integracao:"Integração 1Doc"};$("#page-title").textContent=titles[name]||"SEBASTIAN 1Doc";window.scrollTo({top:0,behavior:"smooth"})}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));

$("#evidencias").addEventListener("change",e=>{filesSelected=[...e.target.files];renderFiles()});
function renderFiles(){$("#file-list").innerHTML=filesSelected.map(f=>`<div class="file-item"><span>▧ ${escapeHtml(f.name)}</span><small>${(f.size/1024).toFixed(0)} KB · anexo selecionado</small></div>`).join("")}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function getForm(){const data=Object.fromEntries(new FormData($("#inspection-form")).entries());data.arquivos=filesSelected.map(f=>({name:f.name,size:f.size,type:f.type}));return data}
function makeDraft(d){
 const val=(x)=>String(x||"").trim()||"Não informado";
 const coords=[d.coordenadas,d.zona_utm?`Zona UTM ${d.zona_utm}`:"",d.utm_y?`Y: ${d.utm_y}`:"",d.utm_x?`X: ${d.utm_x}`:""].filter(Boolean).join(" · ");
 const annex=d.arquivos?.length?d.arquivos.map((f,i)=>`${i+1}. ${f.name}`).join("\n"):"Nenhum arquivo anexado.";
 const warnings=[];
 if(d.data_requerimento&&d.data_parecer&&d.data_parecer<d.data_requerimento)warnings.push('A data do parecer antecede a data do requerimento.');
 if(d.data&&d.data_parecer&&d.data_parecer<d.data)warnings.push('A data do parecer antecede a data da vistoria.');
 return `RELATÓRIO DE VISTORIA E PARECER TÉCNICO AMBIENTAL\nRASCUNHO PARA REVISÃO TÉCNICA\n\nPROCESSO: ${val(d.processo)} · ${val(d.origem)}\nREQUERENTE: ${val(d.interessado)}\nCPF / CNPJ: ${val(d.documento_requerente)}\nENDEREÇO DO REQUERENTE: ${val(d.endereco_requerente)}\nENDEREÇO DO EMPREENDIMENTO: ${val(d.endereco_empreendimento)}\nMUNICÍPIO: ${val(d.municipio)} · ZONA: ${val(d.zona)}\nCOORDENADAS: ${val(coords)}\nATIVIDADE SOLICITADA: ${val(d.atividade)}\nPORTE: ${val(d.porte)} · POTENCIAL POLUIDOR: ${val(d.potencial_poluidor)}\n\n1. INTRODUÇÃO\n${val(d.objetivo)}\n\nData do requerimento: ${val(d.data_requerimento)}\nAnálise documental / setor: ${val(d.setor_analise)}\nResponsável pela análise documental: ${val(d.responsavel_analise)}\n\n2. ANÁLISE TÉCNICA\nData e horário da vistoria: ${val(d.data)} · ${val(d.hora_vistoria)}\nResponsável técnico: ${val(d.tecnico)} · ${val(d.matricula_tecnico)}\n\nDescrição do estudo apresentado\n${val(d.estudo_apresentado)}\n\nFatos e condições observadas\n${val(d.observacoes)}\n\nCaracterização ambiental\n${val(d.caracterizacao_ambiental)}\n\nSolo, acesso e alterações observadas\n${val(d.condicoes_solo)}\n\nPossíveis impactos / não conformidades\n${val(d.impactos)}\n\n4. RECOMENDAÇÕES TÉCNICAS\n${val(d.recomendacoes)}\n\nEtapas e documentos pendentes\n${val(d.etapas_pendentes)}\n\n5. CONSIDERAÇÕES E CONCLUSÃO\n${val(d.conclusao)}\n\n${val(d.municipio)}${d.data_parecer?`, ${d.data_parecer}`:""}.\n\n${val(d.assinante)}\n${val(d.cargo_assinante)}\nMatrícula / registro: ${val(d.registro_assinante)}\n\nANEXO · REGISTRO FOTOGRÁFICO E DOCUMENTAL\n${annex}\n\n${warnings.length?`PONTOS PARA CONFERÊNCIA\n${warnings.map((w,i)=>`${i+1}. ${w}`).join("\n")}\n\n`:""}NOTA DE REVISÃO\nEste documento é um rascunho estruturado com os dados cadastrados. Confira datas, documentos, fatos observados, referências legais, recomendações e conclusão com o profissional responsável antes de assinar, protocolar ou usar oficialmente.\n`;
}
$("#inspection-form").addEventListener("submit",async e=>{
 e.preventDefault();const button=e.submitter;button.disabled=true;const uploaded=[];let saved=false;
 try {
 if(!currentUser)throw Error('Entre para salvar.');
 const d=getForm(),id=crypto.randomUUID();
 if(filesSelected.some(f=>f.size>20971520))throw Error('Cada anexo deve ter no máximo 20 MB.');
 d.arquivos=[];
 for(const f of filesSelected){const path=currentUser.id+'/'+id+'/'+crypto.randomUUID()+'-'+safeName(f.name);const {error}=await db.storage.from('evidencias').upload(path,f);if(error)throw error;uploaded.push(path);d.arquivos.push({name:f.name,size:f.size,type:f.type,path});}
 const {error}=await db.from('reports').insert({id,user_id:currentUser.id,data:d,content:makeDraft(d)});if(error)throw error;saved=true;
 $("#inspection-form").reset();filesSelected=[];renderFiles();await loadReports();toast('Vistoria e anexos salvos.');showView('relatorios');
 }catch(error){if(!saved&&uploaded.length)await db.storage.from('evidencias').remove(uploaded);toast(saved?'Salvo no banco. Recarregue para atualizar a lista.':'Não foi possível salvar: '+error.message)}finally{button.disabled=false}
});
$("#clear-form").addEventListener("click",()=>{if(confirm("Limpar os campos preenchidos?")){$("#inspection-form").reset();filesSelected=[];renderFiles()}});
function renderReports(){const root=$("#reports-list");if(!reports.length){root.innerHTML='<div class="empty-state"><span>▤</span><h3>Nenhum rascunho salvo</h3><p>Registre uma vistoria para preparar o primeiro documento.</p></div>';return}
 root.innerHTML=reports.map(r=>`<article class="report-card"><div class="report-top"><div><h3>${escapeHtml(r.data.interessado||"Vistoria ambiental")}</h3><div class="report-meta">Processo: ${escapeHtml(r.data.processo)} · ${escapeHtml(r.data.municipio)} · ${escapeHtml(r.data.data)}</div></div><span class="draft-badge">RASCUNHO</span></div><p>${escapeHtml((r.data.objetivo||"").slice(0,230))}</p><div class="report-actions">${(r.data.arquivos||[]).filter(f=>f.path).map((f,i)=>`<button class="secondary" data-action="file" data-file="${i}" data-id="${r.id}">${escapeHtml(f.name)}</button>`).join("")}<button class="primary" data-action="txt" data-id="${r.id}">Exportar TXT</button><button class="secondary" data-action="print" data-id="${r.id}">Imprimir / salvar PDF</button><button class="secondary" data-action="delete" data-id="${r.id}">Excluir</button></div></article>`).join("");
 $$("[data-action]",root).forEach(b=>b.addEventListener("click",async ()=>{try{const r=reports.find(x=>String(x.id)===b.dataset.id);if(!r)return;if(b.dataset.action==="txt")downloadText(`relatorio-${safeName(r.data.processo)}.txt`,r.content);if(b.dataset.action==="print")printReport(r);if(b.dataset.action==="file"){const f=r.data.arquivos.filter(f=>f.path)[Number(b.dataset.file)];const {data,error}=await db.storage.from('evidencias').download(f.path);if(error)throw error;const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=f.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 if(b.dataset.action==="delete"&&confirm('Excluir esta vistoria e seus anexos?')){const paths=(r.data.arquivos||[]).filter(f=>f.path).map(f=>f.path);if(paths.length){const {error}=await db.storage.from('evidencias').remove(paths);if(error)throw error;}const {error}=await db.from('reports').delete().eq('id',r.id);if(error)throw error;await loadReports();toast('Vistoria excluída.');}
 }catch(error){toast('Não foi possível concluir: '+error.message)}}))
}
function safeName(s){return String(s||"vistoria").replace(/[^a-z0-9_-]/gi,"-").slice(0,60)}
function downloadText(name,content){const blob=new Blob([content],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
function printReport(r){const w=window.open("","_blank");if(!w){toast("Permita pop-ups para imprimir o relatório.");return}w.document.write(`<html><head><title>Relatório de vistoria</title><style>body{font:12pt Arial;line-height:1.6;margin:2.5cm;white-space:pre-wrap}h1{font-size:18pt}</style></head><body><h1>SEBASTIAN 1Doc</h1><pre style="white-space:pre-wrap;font:11pt Arial">${escapeHtml(r.content)}</pre><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close()}
async function setSession(session){currentUser=session?.user||null;reports=[];updateMetrics();$('#workspace').hidden=!currentUser;$('#auth-panel').hidden=!!currentUser;$('#account-email').textContent=currentUser?.email||'';if(currentUser){try{await loadReports()}catch(e){toast('Falha ao carregar: '+e.message)}}}
$('#auth-form').addEventListener('submit',async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;$('#auth-message').textContent='Entrando…';try{const {data,error}=await db.auth.signInWithPassword({email:$('#email').value,password:$('#password').value});if(error)throw error;$('#password').value='';$('#auth-message').textContent='';await setSession(data.session)}catch(e){$('#auth-message').textContent=e.message}finally{b.disabled=false}});
$('#logout').addEventListener('click',async()=>{const {error}=await db.auth.signOut();if(error){toast(error.message);return}await setSession(null)});
db.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT')void setSession(null)});
const {data:{session}}=await db.auth.getSession();await setSession(session);
