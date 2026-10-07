'use strict';
const repository = 'https://github.com/MR-Eini/SWATplus62-Portable-Workflow';
const stages = {
  setup: { title: 'Build your model foundation.', category: 'MODEL FOUNDATION', launcher: 'st1_run.bat', folder: '1_Setup', description: 'Prepare inputs and generate the clean setup used by later modules. The setup stage places one tested Intel revision 62 executable in the generated model folder.' },
  check: { title: 'Look closely before you calibrate.', category: 'MODEL VERIFICATION', launcher: 'st2_run.bat', folder: '2_SWATdoctR', description: 'Open the SWATdoctR module to check model behavior and produce a verification report. The bundled checks include revision 62 plant-schema diagnostics and cleanup of temporary verification runs.' },
  crop: { title: 'Bring crop yields into calibration.', category: 'SOFT CALIBRATION', launcher: 'st3_run.bat', folder: '3_CropYield/softcal', description: 'Open the crop-yield module for soft calibration. Use catchment-appropriate crop observations and assess the resulting model response as part of your research workflow.' },
  river: { title: 'Connect the model to river discharge.', category: 'HARD CALIBRATION', launcher: 'st4_run.bat', folder: '4_RiverDischarge/hardcal', description: 'Open the river-discharge module for hard calibration, validation, and verification. Evaluate model performance against the observations and criteria appropriate to your catchment.' },
  status: { title: 'Establish the management baseline.', category: 'FARM MANAGEMENT', launcher: 'st51_run.bat', folder: '5_NBS/1_Managment_scenario/1_Statusquo/FarmR_project', description: 'Explore status-quo farm management with the dedicated baseline module. Use your prepared model and catchment management inputs to define the scenario against which alternatives are evaluated.' },
  cover: { title: 'Explore cover-crop management.', category: 'FARM MANAGEMENT', launcher: 'st52_run.bat', folder: '5_NBS/1_Managment_scenario/2_Covcrop/FarmR_project', description: 'Open the cover-crop management module to explore a cover-crop scenario. Interpret simulated changes in the context of your calibrated model, input data, and management assumptions.' },
  rotation: { title: 'Explore different crop rotations.', category: 'FARM MANAGEMENT', launcher: 'st53_run.bat', folder: '5_NBS/1_Managment_scenario/3_CropRotation/FarmR_project', description: 'Open the crop-rotation management module to explore alternative rotations. Keep model configuration and evaluation criteria consistent when comparing management scenarios.' },
  nbs: { title: 'Explore nature-based solutions.', category: 'SCENARIOS & INDICATORS', launcher: 'st54_run.bat', folder: '5_NBS/2_NBS_simulations', description: 'Open the nature-based solutions module for scenario simulations and indicators. Compare outcomes within the scope supported by your catchment data and model evaluation.' }
};
const tabs = [...document.querySelectorAll('[data-stage]')];
function selectStage(tab, focus = false) {
  const stage = stages[tab.dataset.stage];
  tabs.forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
  document.getElementById('stage-panel').setAttribute('aria-labelledby', tab.id);
  document.getElementById('stage-category').textContent = stage.category;
  document.getElementById('stage-index').textContent = `STAGE ${String(tabs.indexOf(tab) + 1).padStart(2, '0')} / 08`;
  document.getElementById('stage-title').textContent = stage.title;
  document.getElementById('stage-description').textContent = stage.description;
  document.getElementById('stage-launcher').textContent = stage.launcher;
  document.getElementById('stage-docs').href = `${repository}/tree/main/_Workflow/${stage.folder}`;
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectStage(tab));
  tab.addEventListener('keydown', event => {
    const changes = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 };
    let next;
    if (event.key in changes) next = (index + changes[event.key] + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectStage(tabs[next], true); }
  });
});
let toastTimer;
function announce(message) {
  const toast = document.getElementById('copy-status');
  toast.textContent = message; toast.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
}
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const previousFocus = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = text; textarea.setAttribute('aria-label', 'Commands to copy');
  textarea.style.cssText = 'position:fixed;top:0;left:-9999px';
  document.body.appendChild(textarea); textarea.select();
  const copied = document.execCommand('copy'); textarea.remove();
  if (previousFocus) previousFocus.focus();
  if (!copied) throw new Error('Clipboard unavailable');
}
document.querySelectorAll('[data-copy], [data-copy-stage]').forEach(button => {
  button.addEventListener('click', async () => {
    const text = button.hasAttribute('data-copy-stage') ? document.getElementById('stage-launcher').textContent : document.getElementById(button.dataset.copy).textContent;
    try { await copyText(text); announce(button.hasAttribute('data-copy-stage') ? 'Launcher copied.' : 'Setup commands copied.'); }
    catch { announce('Select the commands and copy them manually.'); }
  });
});
const menu = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('open', open); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
