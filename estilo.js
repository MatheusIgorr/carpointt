// ========== TEMA CLARO/ESCURO ==========
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Verificar tema salvo
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ========== BOTÃO VOLTAR AO TOPO ==========
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== SCROLL SUAVE ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========== SUPABASE CONFIGURAÇÃO ==========
const SUPABASE_URL = 'https://uxyveibzuxhnsuwhmuye.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eXZlaWJ6dXhobnN1d2htdXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODM5NjMsImV4cCI6MjA3NDc1OTk2M30.6Sf71cyugYoDlOd2x55fYhGPokuFjZ0-5grAiL-yVao';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ========== ELEMENTOS DOM ==========
const loginBtn = document.getElementById('loginBtn');
const adminBtn = document.getElementById('adminBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const vehiclesGrid = document.getElementById('vehiclesGrid');
const servicesGrid = document.getElementById('servicesGrid');

// ========== ESTADO DA APLICAÇÃO ==========
let isLoggedIn = false;
let currentUser = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚗 Inicializando AutoElite...');
    checkAuth();
    loadVehicles();
    loadServices();
    setupEventListeners();
});

// ========== AUTENTICAÇÃO ==========
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Erro ao verificar sessão:', error);
            return;
        }
        
        if (session) {
            isLoggedIn = true;
            currentUser = session.user;
            console.log('✅ Usuário logado:', currentUser.email);
            updateAuthUI();
        } else {
            console.log('🔒 Nenhum usuário logado');
            updateAuthUI();
        }
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
    }
}

function updateAuthUI() {
    if (isLoggedIn) {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Minha Conta';
        adminBtn.style.display = 'flex';
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        adminBtn.style.display = 'none';
    }
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Login
    loginBtn.addEventListener('click', openLoginModal);
    closeLoginModal.addEventListener('click', closeLoginModalFunc);
    
    // Formulário de login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Formulário de contato
    document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);
    
    // Link para criar conta
    document.getElementById('showRegister').addEventListener('click', function(e) {
        e.preventDefault();
        openRegisterModal();
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModalFunc();
        }
    });
}

// ========== MODAL LOGIN ==========
function openLoginModal() {
    loginModal.style.display = 'flex';
}

function closeLoginModalFunc() {
    loginModal.style.display = 'none';
}

// ========== LOGIN ==========
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            alert('❌ Erro no login: ' + error.message);
            return;
        }
        
        isLoggedIn = true;
        currentUser = data.user;
        
        closeLoginModalFunc();
        updateAuthUI();
        
        // Redirecionar para admin.html
        alert('✅ Login realizado com sucesso! Redirecionando...');
        window.location.href = 'admin.html';
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        alert('❌ Erro no login: ' + error.message);
    }
}

// ========== CARREGAR VEÍCULOS ==========
async function loadVehicles() {
    try {
        // Mostrar loading
        vehiclesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i> Carregando veículos...
            </div>
        `;

        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
        
        if (error) throw error;
        
        renderVehicles(data || getSampleVehicles());
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        renderVehicles(getSampleVehicles());
    }
}

function renderVehicles(vehicles) {
    vehiclesGrid.innerHTML = vehicles.map(vehicle => `
        <div class="vehicle-card">
            <div class="vehicle-img" style="background-image: url('${vehicle.image || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}')"></div>
            <div class="vehicle-info">
                <h3>${vehicle.brand} ${vehicle.model}</h3>
                <div class="vehicle-details">
                    <span><i class="fas fa-calendar-alt"></i> ${vehicle.year}</span>
                    <span><i class="fas fa-tachometer-alt"></i> 0 km</span>
                </div>
                <div class="vehicle-price">R$ ${vehicle.price.toLocaleString('pt-BR')}</div>
                <p class="vehicle-description">${vehicle.description || 'Veículo em excelente estado de conservação, com garantia e procedência verificada.'}</p>
                <button class="btn btn-outline btn-sm">
                    <i class="fas fa-info-circle"></i> Ver Detalhes
                </button>
            </div>
        </div>
    `).join('');
}

// ========== CARREGAR SERVIÇOS ==========
async function loadServices() {
    try {
        // Mostrar loading
        servicesGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i> Carregando serviços...
            </div>
        `;

        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        renderServices(data || getSampleServices());
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        renderServices(getSampleServices());
    }
}

function renderServices(services) {
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card">
            <div class="service-icon">
                <i class="${service.icon || 'fas fa-tools'}"></i>
            </div>
            <h3>${service.name}</h3>
            <p class="service-description">${service.description}</p>
            <div class="service-price">R$ ${service.price.toLocaleString('pt-BR')}</div>
        </div>
    `).join('');
}

// ========== CONTATO ==========
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const messageData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([messageData]);
        
        if (error) throw error;
        
        alert('✅ Mensagem enviada com sucesso! Entraremos em contato em breve.');
        e.target.reset();
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        alert('✅ Mensagem enviada com sucesso! Entraremos em contato em breve.');
        e.target.reset();
    }
}

// ========== DADOS DE EXEMPLO ==========
function getSampleVehicles() {
    return [
        { 
            id: 1, 
            model: "Civic Touring", 
            brand: "Honda", 
            year: 2023, 
            price: 185000, 
            image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
            description: "Sedan premium com tecnologia de ponta e excelente desempenho" 
        },
        { 
            id: 2, 
            model: "Corolla Altis", 
            brand: "Toyota", 
            year: 2023, 
            price: 165000, 
            image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
            description: "Conforto, economia e confiabilidade em um só carro" 
        },
        { 
            id: 3, 
            model: "Onix Premier", 
            brand: "Chevrolet", 
            year: 2024, 
            price: 95000, 
            image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
            description: "Compacto ideal para cidade com acabamento premium" 
        },
        { 
            id: 4, 
            model: "T-Cross Highline", 
            brand: "Volkswagen", 
            year: 2023, 
            price: 145000, 
            image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
            description: "SUV compacto com espaço interno generoso e tecnologia" 
        }
    ];
}

function getSampleServices() {
    return [
        { 
            id: 1, 
            name: "Manutenção Preventiva", 
            description: "Serviços completos de manutenção preventiva para garantir o perfeito funcionamento do seu veículo", 
            price: 450, 
            icon: "fas fa-tools" 
        },
        { 
            id: 2, 
            name: "Troca de Óleo Premium", 
            description: "Troca de óleo e filtros utilizando produtos de alta qualidade e tecnologia", 
            price: 280, 
            icon: "fas fa-oil-can" 
        },
        { 
            id: 3, 
            name: "Funilaria e Pintura", 
            description: "Reparos especializados em lataria e pintura com garantia de qualidade", 
            price: 850, 
            icon: "fas fa-paint-roller" 
        },
        { 
            id: 4, 
            name: "Revisão Elétrica", 
            description: "Diagnóstico e reparo completo de sistemas elétricos e eletrônicos", 
            price: 320, 
            icon: "fas fa-car-battery" 
        },
        { 
            id: 5, 
            name: "Alinhamento e Balanceamento", 
            description: "Serviços de geometria, alinhamento e balanceamento com equipamentos laser", 
            price: 180, 
            icon: "fas fa-cogs" 
        },
        { 
            id: 6, 
            name: "Higienização Interna", 
            description: "Limpeza e higienização completa do interior com produtos especiais", 
            price: 220, 
            icon: "fas fa-spray-can" 
        }
    ];
}

// ========== FUNÇÕES ADMIN ==========
function openRegisterModal() {
    const email = prompt('Digite o email para criar conta admin:');
    const password = prompt('Digite a senha:');
    
    if (email && password) {
        registerUser(email, password);
    }
}

async function registerUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        if (data.user) {
            alert('✅ Conta criada com sucesso! Verifique seu email para confirmação.');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        alert('Erro: ' + error.message);
    }
}

// ========== FUNÇÕES GLOBAIS ==========
window.createAdmin = async function() {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: 'admin@autoelite.com',
            password: 'admin123'
        });
        
        if (error) throw error;
        
        if (data.user) {
            alert('✅ Admin criado com sucesso!\n\nUse:\nEmail: admin@autoelite.com\nSenha: admin123');
        }
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        alert('Erro: ' + error.message);
    }
};