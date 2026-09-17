const form=document.querySelector('#lead-form');
const statusEl=document.querySelector('#form-status');
const queryParams=new URLSearchParams(window.location.search);
form.querySelectorAll('[data-query-param]').forEach((field)=>{
  field.value=queryParams.get(field.dataset.queryParam)||'';
});
form.querySelector('#landing-page-url').value=window.location.href;
form.addEventListener('submit',async(event)=>{
  event.preventDefault();
  const button=form.querySelector('button[type="submit"]');
  statusEl.className='form-status';
  statusEl.textContent='Sending your request…';
  button.disabled=true;
  try{
    const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Request failed');
    form.reset();
    sessionStorage.setItem('zebra_lead_submitted','1');
    window.location.assign('./thank-you.html');
  }catch(error){
    statusEl.className='form-status error';
    statusEl.innerHTML='We could not send the form. Please email <a href="mailto:info@zebragolfcart.com">info@zebragolfcart.com</a>.';
  }finally{button.disabled=false}
});
