const tabs = document.querySelectorAll('[data-tabs] .tab');
const panels = document.querySelectorAll('[data-panel]');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const serviceSelect = document.querySelector('#service-select');
const pickupTime = document.querySelector('#pickup-time');
const pickupAddress = document.querySelector('#pickup-address');
const whatsappTriggers = document.querySelectorAll('.js-whatsapp-trigger');
const modalBackdrop = document.querySelector('.modal-backdrop');
const confirmModal = document.querySelector('.confirm-modal');
const confirmPreview = document.querySelector('.confirm-modal-preview');
const confirmContinue = document.querySelector('.confirm-continue');
const confirmCancel = document.querySelector('.confirm-cancel');
const chatLauncher = document.querySelector('.chat-launcher');
const chatWidget = document.querySelector('.chat-widget');
const chatClose = document.querySelector('.chat-close');
const chatMessages = document.querySelector('.chat-messages');
const chatQuickActions = document.querySelector('.chat-quick-actions');
const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const businessNumber = '918297779966';
const redirectDelayMs = 1600;

let redirectTimeoutId = null;
let pendingWhatsappUrl = '';
let chatInitialized = false;

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    tabs.forEach((btn) => btn.classList.remove('active'));
    panels.forEach((panel) => panel.classList.remove('active'));

    tab.classList.add('active');
    document.querySelector(`[data-panel="${target}"]`).classList.add('active');
  });
});

const buildInstantRequestMessage = () => {
  const service = serviceSelect ? serviceSelect.value : 'Laundry service';
  const time = pickupTime && pickupTime.value.trim() ? pickupTime.value.trim() : 'Please suggest an available time';
  const address = pickupAddress && pickupAddress.value.trim() ? pickupAddress.value.trim() : 'I will share the address on chat';

  return [
    'Hi YouClean, I want to book an instant pickup request.',
    `Service selected: ${service}`,
    `Preferred pickup time: ${time}`,
    `Pickup area: ${address}`,
  ].join('\n');
};

const buildGeneralMessage = () => {
  return [
    'Hi YouClean, I want to book a pickup.',
    'Please help me with available pickup timing.',
  ].join('\n');
};

const buildWhatsappUrl = (message) => {
  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
};

const getPricePageUrl = (anchor = '') => {
  const pricePage = window.location.pathname.endsWith('/prices.html') || window.location.pathname.endsWith('prices.html')
    ? 'prices.html'
    : 'prices.html';
  return `${pricePage}${anchor}`;
};

const chatFooterLine = 'Free pickup and delivery service is available.';

const createChatBubble = (text, role = 'bot') => {
  if (!chatMessages) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const createChatAction = (label, config = {}) => {
  const action = document.createElement(config.href ? 'a' : 'button');
  action.className = 'chat-action';
  action.textContent = label;

  if (config.href) {
    action.setAttribute('href', config.href);
  } else {
    action.setAttribute('type', 'button');
  }

  if (config.onClick) {
    action.addEventListener('click', config.onClick);
  }

  return action;
};

const renderChatQuickActions = (actions = []) => {
  if (!chatQuickActions) return;
  chatQuickActions.innerHTML = '';
  actions.forEach((actionConfig) => {
    chatQuickActions.appendChild(createChatAction(actionConfig.label, {
      href: actionConfig.href,
      onClick: actionConfig.onClick,
    }));
  });
};

const appendBotResponse = (text, options = {}) => {
  createChatBubble(`${text}\n${chatFooterLine}`, 'bot');
  if (options.inlineActions && chatMessages) {
    const container = document.createElement('div');
    container.className = 'chat-inline-actions';
    options.inlineActions.forEach((actionConfig) => {
      container.appendChild(createChatAction(actionConfig.label, {
        href: actionConfig.href,
        onClick: actionConfig.onClick,
      }));
    });
    chatMessages.appendChild(container);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  renderChatQuickActions(options.quickActions || []);
};

const askDrycleaningCategory = () => {
  appendBotResponse('We offer drycleaning across Men, Women, Household, Kids/children, and Luxury items. Which category would you like to explore?', {
    quickActions: [
      { label: 'Men Drycleaning', onClick: () => handleChatMessage('Men drycleaning') },
      { label: 'Women Drycleaning', onClick: () => handleChatMessage('Women drycleaning') },
      { label: 'Household Drycleaning', onClick: () => handleChatMessage('Household drycleaning') },
      { label: 'Kids Drycleaning', onClick: () => handleChatMessage('Kids drycleaning') },
      { label: 'Luxury Drycleaning', onClick: () => handleChatMessage('Luxury drycleaning') },
      { label: 'View price list', href: getPricePageUrl('#price-catalog') },
    ],
  });
};

const askSteamIronCategory = () => {
  appendBotResponse('For steam iron, you can browse Men, Women, Household, Kids/children, and Luxury items. Which category do you want to check?', {
    quickActions: [
      { label: 'Men Steam Iron', onClick: () => handleChatMessage('Men steam iron') },
      { label: 'Women Steam Iron', onClick: () => handleChatMessage('Women steam iron') },
      { label: 'Household Steam Iron', onClick: () => handleChatMessage('Household steam iron') },
      { label: 'Kids Steam Iron', onClick: () => handleChatMessage('Kids steam iron') },
      { label: 'View steam prices', href: getPricePageUrl('#price-catalog') },
    ],
  });
};

const categoryResponse = (label, service) => {
  const serviceLabel = service === 'steam-iron' ? 'steam iron' : 'drycleaning';
  appendBotResponse(`You selected ${label} for ${serviceLabel}. Tell us the product name you want cleaned, or open the detailed price list below.`, {
    inlineActions: [
      { label: 'View price list', href: getPricePageUrl('#price-catalog') },
      { label: 'Book on WhatsApp', href: buildWhatsappUrl(`Hi YouClean, I need help with ${label} ${serviceLabel}. Please guide me with the best option.\n${chatFooterLine}`) },
    ],
    quickActions: [
      { label: 'Ask another category', onClick: () => handleChatMessage(serviceLabel) },
      { label: 'Book pickup', onClick: () => handleChatMessage('book pickup') },
    ],
  });
};

function handleChatMessage(message) {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return;

  createChatBubble(message, 'user');

  if (normalized.includes('dryclean')) {
    if (normalized.includes('men')) {
      categoryResponse('Men', 'drycleaning');
      return;
    }
    if (normalized.includes('women')) {
      categoryResponse('Women', 'drycleaning');
      return;
    }
    if (normalized.includes('household')) {
      categoryResponse('Household', 'drycleaning');
      return;
    }
    if (normalized.includes('kids')) {
      categoryResponse('Kids/children', 'drycleaning');
      return;
    }
    if (normalized.includes('luxury')) {
      categoryResponse('Luxury', 'drycleaning');
      return;
    }
    askDrycleaningCategory();
    return;
  }

  if (normalized.includes('steam iron') || normalized.includes('steam') || normalized.includes('iron')) {
    if (normalized.includes('men')) {
      categoryResponse('Men', 'steam-iron');
      return;
    }
    if (normalized.includes('women')) {
      categoryResponse('Women', 'steam-iron');
      return;
    }
    if (normalized.includes('household')) {
      categoryResponse('Household', 'steam-iron');
      return;
    }
    if (normalized.includes('kids')) {
      categoryResponse('Kids/children', 'steam-iron');
      return;
    }
    askSteamIronCategory();
    return;
  }

  if (normalized.includes('price') || normalized.includes('rate') || normalized.includes('cost')) {
    appendBotResponse('You can open the detailed price list to check category-wise YouClean prices for drycleaning and steam iron.', {
      inlineActions: [
        { label: 'Open price list', href: getPricePageUrl('#price-catalog') },
      ],
      quickActions: [
        { label: 'Drycleaning help', onClick: () => handleChatMessage('drycleaning') },
        { label: 'Steam iron help', onClick: () => handleChatMessage('steam iron') },
      ],
    });
    return;
  }

  if (normalized.includes('pickup') || normalized.includes('delivery') || normalized.includes('book')) {
    appendBotResponse('We can help you book a pickup. Tell us the service, preferred time, and area, or continue on WhatsApp for quick confirmation.', {
      inlineActions: [
        { label: 'Book on WhatsApp', href: buildWhatsappUrl(`Hi YouClean, I want to book a pickup. Please guide me with the next steps.\n${chatFooterLine}`) },
      ],
      quickActions: [
        { label: 'Drycleaning', onClick: () => handleChatMessage('drycleaning') },
        { label: 'Steam Iron', onClick: () => handleChatMessage('steam iron') },
        { label: 'Prices', onClick: () => handleChatMessage('prices') },
      ],
    });
    return;
  }

  if (normalized.includes('saree') || normalized.includes('curtain') || normalized.includes('shoe') || normalized.includes('shirt')) {
    appendBotResponse('We handle that item type. If you want exact pricing, open the price list, or tell us whether you want drycleaning or steam iron support.', {
      inlineActions: [
        { label: 'View price list', href: getPricePageUrl('#price-catalog') },
      ],
      quickActions: [
        { label: 'Drycleaning', onClick: () => handleChatMessage('drycleaning') },
        { label: 'Steam Iron', onClick: () => handleChatMessage('steam iron') },
      ],
    });
    return;
  }

  appendBotResponse('I can help with drycleaning categories, steam iron categories, pricing, and booking a pickup. What would you like to explore?', {
    quickActions: [
      { label: 'Drycleaning', onClick: () => handleChatMessage('drycleaning') },
      { label: 'Steam Iron', onClick: () => handleChatMessage('steam iron') },
      { label: 'Prices', onClick: () => handleChatMessage('prices') },
      { label: 'Book Pickup', onClick: () => handleChatMessage('book pickup') },
    ],
  });
}

const openChat = () => {
  if (!chatWidget || !chatLauncher) return;
  chatWidget.hidden = false;
  chatLauncher.setAttribute('aria-expanded', 'true');

  if (!chatInitialized) {
    appendBotResponse('Hi, I can guide you through drycleaning, steam iron, pricing, or booking a pickup.', {
      quickActions: [
        { label: 'Drycleaning', onClick: () => handleChatMessage('drycleaning') },
        { label: 'Steam Iron', onClick: () => handleChatMessage('steam iron') },
        { label: 'Prices', onClick: () => handleChatMessage('prices') },
        { label: 'Book Pickup', onClick: () => handleChatMessage('book pickup') },
      ],
    });
    chatInitialized = true;
  }
};

const closeChat = () => {
  if (!chatWidget || !chatLauncher) return;
  chatWidget.hidden = true;
  chatLauncher.setAttribute('aria-expanded', 'false');
};

const closeModal = () => {
  if (redirectTimeoutId) {
    window.clearTimeout(redirectTimeoutId);
    redirectTimeoutId = null;
  }

  pendingWhatsappUrl = '';
  if (modalBackdrop) {
    modalBackdrop.hidden = true;
  }
  if (confirmModal) {
    confirmModal.hidden = true;
  }
  if (confirmPreview) {
    confirmPreview.textContent = '';
  }
  if (confirmContinue) {
    confirmContinue.setAttribute('href', '#');
  }
};

const redirectToWhatsapp = () => {
  if (!pendingWhatsappUrl) return;
  window.location.href = pendingWhatsappUrl;
};

const openConfirmationModal = (message, url) => {
  if (!modalBackdrop || !confirmModal || !confirmPreview || !confirmContinue) {
    window.location.href = url;
    return;
  }

  pendingWhatsappUrl = url;
  confirmPreview.textContent = message;
  confirmContinue.setAttribute('href', url);
  modalBackdrop.hidden = false;
  confirmModal.hidden = false;

  if (redirectTimeoutId) {
    window.clearTimeout(redirectTimeoutId);
  }

  redirectTimeoutId = window.setTimeout(() => {
    redirectToWhatsapp();
  }, redirectDelayMs);
};

whatsappTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();

    const source = trigger.getAttribute('data-whatsapp-source');
    const message = source === 'instant-request'
      ? buildInstantRequestMessage()
      : buildGeneralMessage();

    openConfirmationModal(message, buildWhatsappUrl(message));
  });
});

if (confirmContinue) {
  confirmContinue.addEventListener('click', (event) => {
    event.preventDefault();
    if (redirectTimeoutId) {
      window.clearTimeout(redirectTimeoutId);
      redirectTimeoutId = null;
    }
    redirectToWhatsapp();
  });
}

if (confirmCancel) {
  confirmCancel.addEventListener('click', () => {
    closeModal();
  });
}

if (modalBackdrop) {
  modalBackdrop.addEventListener('click', () => {
    closeModal();
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && confirmModal && !confirmModal.hidden) {
    closeModal();
  }
});

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (chatLauncher) {
  chatLauncher.addEventListener('click', () => {
    if (chatWidget && !chatWidget.hidden) {
      closeChat();
      return;
    }
    openChat();
  });
}

if (chatClose) {
  chatClose.addEventListener('click', () => {
    closeChat();
  });
}

if (chatForm) {
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!chatInput) return;
    const value = chatInput.value.trim();
    if (!value) return;
    handleChatMessage(value);
    chatInput.value = '';
  });
}

closeModal();
closeChat();

const revealItems = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.88;
  revealItems.forEach((item) => {
    const top = item.getBoundingClientRect().top;
    if (top < trigger) {
      item.classList.add('show');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ─── Referral Section ────────────────────────────────────────────────────────

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

const referralCode = 'YOUCLEAN100';
const referralLink = `https://www.youcleanlaundry.in/?ref=${referralCode}`;

// WhatsApp share intent — opens contact picker, NOT business chat
const buildReferralShareUrl = () => {
  const text = encodeURIComponent(
    `Get 10% off your first YouClean order. Use my code ${referralCode} 👇 ${referralLink}`
  );
  return `https://wa.me/?text=${text}`;
};

// "Invite via WhatsApp" — opens WhatsApp contact picker so user picks ANY friend
const referShareBtn = document.querySelector('.js-refer-share');
if (referShareBtn) {
  referShareBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.open(buildReferralShareUrl(), '_blank');
  });
}

// "Copy Invite Link" — clipboard copy with 2s "Copied!" feedback
const referCopyBtn = document.querySelector('.js-refer-copy');
if (referCopyBtn) {
  referCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      const original = referCopyBtn.textContent;
      referCopyBtn.textContent = 'Copied!';
      referCopyBtn.setAttribute('disabled', 'true');
      setTimeout(() => {
        referCopyBtn.textContent = original;
        referCopyBtn.removeAttribute('disabled');
      }, 2000);
    });
  });
}

// QR block: on mobile, tapping it triggers the share directly
const referQrBlock = document.querySelector('.js-mobile-share');
if (referQrBlock && isMobileDevice()) {
  referQrBlock.setAttribute('role', 'button');
  referQrBlock.setAttribute('tabindex', '0');
  referQrBlock.style.cursor = 'pointer';
  const triggerShare = () => window.open(buildReferralShareUrl(), '_blank');
  referQrBlock.addEventListener('click', triggerShare);
  referQrBlock.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') triggerShare();
  });
}

// #refer hash: auto-scroll + brief glow highlight
const handleReferHash = () => {
  if (!window.location.hash.startsWith('#refer')) return;
  const referSection = document.getElementById('refer');
  if (!referSection) return;
  setTimeout(() => {
    referSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    referSection.classList.add('refer-highlight');
    setTimeout(() => referSection.classList.remove('refer-highlight'), 2200);
  }, 300);
};

window.addEventListener('load', handleReferHash);
window.addEventListener('hashchange', handleReferHash);
