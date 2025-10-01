    const SUPABASE_URL = 'https://uxyveibzuxhnsuwhmuye.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eXZlaWJ6dXhobnN1d2htdXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODM5NjMsImV4cCI6MjA3NDc1OTk2M30.6Sf71cyugYoDlOd2x55fYhGPokuFjZ0-5grAiL-yVao';
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Elementos DOM
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');
    const vehiclesGrid = document.getElementById('vehiclesGrid');
    const servicesGrid = document.getElementById('servicesGrid');
    const adminTabs = document.querySelectorAll('.admin-tab');
    const adminContents = document.querySelectorAll('.admin-content');
    const vehiclesTable = document.getElementById('vehiclesTable');
    const servicesTable = document.getElementById('servicesTable');
    const messagesTable = document.getElementById('messagesTable');
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    const addServiceBtn = document.getElementById('addServiceBtn');
    const vehicleForm = document.getElementById('vehicleForm');
    const serviceForm = document.getElementById('serviceForm');
    const vehicleFormElement = document.getElementById('vehicleFormElement');
    const serviceFormElement = document.getElementById('serviceFormElement');
    const cancelVehicleForm = document.getElementById('cancelVehicleForm');
    const cancelServiceForm = document.getElementById('cancelServiceForm');

    // Estado da aplicação
    let isLoggedIn = false;
    let currentUser = null;

    // Inicialização
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 Inicializando aplicação...');
        checkAuth();
        loadVehicles();
        loadServices();
        setupEventListeners();
    });

    // Verificar autenticação
    async function checkAuth() {
        try {
            console.log('🔐 Verificando autenticação...');
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

    // Atualizar interface baseada no login
    function updateAuthUI() {
        console.log('🔄 Atualizando UI, isLoggedIn:', isLoggedIn);
        if (isLoggedIn) {
            loginBtn.textContent = 'Minha Conta';
            adminBtn.style.display = 'block';
            console.log('✅ Botão Admin mostrado');
        } else {
            loginBtn.textContent = 'Login';
            adminBtn.style.display = 'none';
            adminPanel.style.display = 'none';
            console.log('❌ Botão Admin escondido');
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Login
        loginBtn.addEventListener('click', openLoginModal);
        closeLoginModal.addEventListener('click', closeLoginModalFunc);
        
        // Admin
        adminBtn.addEventListener('click', function() {
            if (isLoggedIn) {
                window.location.href = 'admin.html';
            } else {
                openLoginModal();
            }
        });
        
        // Tabs do admin
        adminTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchAdminTab(tabId);
            });
        });
        
        // Botões de ação
        addVehicleBtn.addEventListener('click', () => openVehicleForm());
        addServiceBtn.addEventListener('click', () => openServiceForm());
        
        // Formulários
        vehicleFormElement.addEventListener('submit', handleVehicleSubmit);
        serviceFormElement.addEventListener('submit', handleServiceSubmit);
        cancelVehicleForm.addEventListener('click', () => closeVehicleForm());
        cancelServiceForm.addEventListener('click', () => closeServiceForm());
        
        // Formulário de contato
        document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);
        
        // Formulário de login
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        
        // Link para criar conta
        document.getElementById('showRegister').addEventListener('click', function(e) {
            e.preventDefault();
            openRegisterModal();
        });

        console.log('✅ Event listeners configurados');
    }

    // Função para criar usuário admin (executar no console)
    async function createAdmin() {
        try {
            console.log('👤 Criando usuário admin...');
            const { data, error } = await supabase.auth.signUp({
                email: 'admin@autoelite.com',
                password: 'admin123'
            });
            
            if (error) {
                console.error('❌ Erro ao criar admin:', error);
                alert('Erro: ' + error.message);
                return;
            }
            
            if (data.user) {
                console.log('✅ Admin criado com sucesso!');
                console.log('📧 Email: admin@autoelite.com');
                console.log('🔑 Senha: admin123');
                alert('✅ Admin criado com sucesso!\n\nUse:\nEmail: admin@autoelite.com\nSenha: admin123');
            } else {
                console.log('❌ Nenhum usuário retornado');
            }
        } catch (error) {
            console.error('❌ Erro ao criar admin:', error);
            alert('Erro: ' + error.message);
        }
    }

    // Abrir modal de login
    function openLoginModal() {
        console.log('🔓 Abrindo modal de login');
        loginModal.style.display = 'flex';
    }

    // Fechar modal de login
    function closeLoginModalFunc() {
        loginModal.style.display = 'none';
    }

    // Alternar painel admin
    function toggleAdminPanel() {
        console.log('🔄 Alternando painel admin, isLoggedIn:', isLoggedIn);
        if (isLoggedIn) {
            adminPanel.style.display = adminPanel.style.display === 'block' ? 'none' : 'block';
            console.log('📊 Painel admin:', adminPanel.style.display);
            if (adminPanel.style.display === 'block') {
                loadAdminData();
            }
        } else {
            console.log('🔒 Usuário não logado, abrindo modal de login');
            openLoginModal();
        }
    }

    // Carregar dados no admin
    function loadAdminData() {
        console.log('📥 Carregando dados do admin...');
        loadVehicles();
        loadServices();
        loadMessages();
    }

    // Fazer login
    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('🔐 Tentando login com:', email);
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                console.error('❌ Erro no login:', error);
                alert('❌ Erro no login: ' + error.message);
                return;
            }
            
            isLoggedIn = true;
            currentUser = data.user;
            console.log('✅ Login realizado com sucesso:', currentUser.email);
            
            closeLoginModalFunc();
            updateAuthUI();
            
            // Redirecionar para admin.html após login bem-sucedido
            alert('✅ Login realizado com sucesso! Redirecionando para o painel administrativo...');
            window.location.href = 'admin.html';
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            alert('❌ Erro no login: ' + error.message);
        }
    }

    // Fazer logout
    async function logout() {
        try {
            console.log('🚪 Fazendo logout...');
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            isLoggedIn = false;
            currentUser = null;
            adminPanel.style.display = 'none';
            updateAuthUI();
            alert('✅ Logout realizado com sucesso!');
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            alert('❌ Erro no logout: ' + error.message);
        }
    }

    // Trocar aba no admin
    function switchAdminTab(tabId) {
        // Atualizar tabs
        adminTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Atualizar conteúdo
        adminContents.forEach(content => {
            if (content.id === `${tabId}Content`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Carregar dados específicos da aba
        if (tabId === 'messages') {
            loadMessages();
        }
    }

    // Carregar veículos do Supabase
    async function loadVehicles() {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            renderVehicles(data);
            
            if (isLoggedIn) {
                renderAdminVehicles(data);
            }
        } catch (error) {
            console.error('Erro ao carregar veículos:', error);
            // Dados de exemplo em caso de erro
            const sampleVehicles = [
                { id: 1, model: "Civic", brand: "Honda", year: 2022, price: 120000, image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "Carro esportivo com ótimo desempenho" },
                { id: 2, model: "Corolla", brand: "Toyota", year: 2021, price: 110000, image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "Conforto e economia em um só carro" },
                { id: 3, model: "Onix", brand: "Chevrolet", year: 2023, price: 80000, image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", description: "Compacto ideal para cidade" }
            ];
            renderVehicles(sampleVehicles);
            if (isLoggedIn) {
                renderAdminVehicles(sampleVehicles);
            }
        }
    }

    // Carregar serviços do Supabase
    async function loadServices() {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            renderServices(data);
            
            if (isLoggedIn) {
                renderAdminServices(data);
            }
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            // Dados de exemplo em caso de erro
            const sampleServices = [
                { id: 1, name: "Manutenção Preventiva", description: "Serviços de manutenção preventiva", price: 300, icon: "fas fa-tools" },
                { id: 2, name: "Troca de Óleo", description: "Troca de óleo e filtros", price: 150, icon: "fas fa-oil-can" },
                { id: 3, name: "Funilaria", description: "Reparos de lataria", price: 500, icon: "fas fa-paint-roller" },
                { id: 4, name: "Revisão Elétrica", description: "Diagnóstico e reparo de sistemas elétricos", price: 250, icon: "fas fa-car-battery" }
            ];
            renderServices(sampleServices);
            if (isLoggedIn) {
                renderAdminServices(sampleServices);
            }
        }
    }

    // Carregar mensagens do Supabase
    async function loadMessages() {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            renderAdminMessages(data);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    }

    // Renderizar veículos na página principal
    function renderVehicles(vehicles) {
        vehiclesGrid.innerHTML = '';
        
        vehicles.forEach(vehicle => {
            const vehicleCard = document.createElement('div');
            vehicleCard.className = 'vehicle-card';
            vehicleCard.innerHTML = `
                <div class="vehicle-img" style="background-image: url('${vehicle.image || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}')"></div>
                <div class="vehicle-info">
                    <h3>${vehicle.brand} ${vehicle.model}</h3>
                    <div class="vehicle-details">
                        <span><i class="fas fa-calendar-alt"></i> ${vehicle.year}</span>
                        <span><i class="fas fa-tachometer-alt"></i> 0 km</span>
                    </div>
                    <div class="vehicle-price">R$ ${vehicle.price.toLocaleString('pt-BR')}</div>
                    <p>${vehicle.description || 'Veículo em excelente estado de conservação.'}</p>
                    <button class="btn btn-outline btn-sm">Ver Detalhes</button>
                </div>
            `;
            vehiclesGrid.appendChild(vehicleCard);
        });
    }

    // Renderizar serviços na página principal
    function renderServices(services) {
        servicesGrid.innerHTML = '';
        
        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <div class="service-icon">
                    <i class="${service.icon || 'fas fa-tools'}"></i>
                </div>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <div class="vehicle-price">R$ ${service.price.toLocaleString('pt-BR')}</div>
            `;
            servicesGrid.appendChild(serviceCard);
        });
    }

    // Renderizar veículos no admin
    function renderAdminVehicles(vehicles) {
        vehiclesTable.innerHTML = '';
        
        vehicles.forEach(vehicle => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vehicle.id}</td>
                <td>${vehicle.model}</td>
                <td>${vehicle.brand}</td>
                <td>${vehicle.year}</td>
                <td>R$ ${vehicle.price.toLocaleString('pt-BR')}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editVehicle(${vehicle.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${vehicle.id})">Excluir</button>
                </td>
            `;
            vehiclesTable.appendChild(row);
        });
    }

    // Renderizar serviços no admin
    function renderAdminServices(services) {
        servicesTable.innerHTML = '';
        
        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>${service.description}</td>
                <td>R$ ${service.price.toLocaleString('pt-BR')}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editService(${service.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">Excluir</button>
                </td>
            `;
            servicesTable.appendChild(row);
        });
    }

    // Renderizar mensagens no admin
    function renderAdminMessages(messages) {
        messagesTable.innerHTML = '';
        
        if (messages && messages.length > 0) {
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.id}</td>
                    <td>${message.name}</td>
                    <td>${message.email}</td>
                    <td>${message.subject}</td>
                    <td>${new Date(message.created_at).toLocaleDateString('pt-BR')}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="viewMessage(${message.id})">Ver</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMessage(${message.id})">Excluir</button>
                    </td>
                `;
                messagesTable.appendChild(row);
            });
        } else {
            messagesTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma mensagem encontrada</td></tr>';
        }
    }

    // Formulário de veículo
    function openVehicleForm(vehicleId = null) {
        document.getElementById('vehicleFormTitle').textContent = vehicleId ? 'Editar Veículo' : 'Adicionar Veículo';
        vehicleForm.style.display = 'block';
        
        if (vehicleId) {
            loadVehicleData(vehicleId);
        } else {
            vehicleFormElement.reset();
            document.getElementById('vehicleId').value = '';
        }
    }

    // Carregar dados do veículo para edição
    async function loadVehicleData(vehicleId) {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', vehicleId)
                .single();
            
            if (error) throw error;
            
            if (data) {
                document.getElementById('vehicleId').value = data.id;
                document.getElementById('vehicleModel').value = data.model;
                document.getElementById('vehicleBrand').value = data.brand;
                document.getElementById('vehicleYear').value = data.year;
                document.getElementById('vehiclePrice').value = data.price;
                document.getElementById('vehicleImage').value = data.image || '';
                document.getElementById('vehicleDescription').value = data.description || '';
            }
        } catch (error) {
            console.error('Erro ao carregar dados do veículo:', error);
        }
    }

    function closeVehicleForm() {
        vehicleForm.style.display = 'none';
    }

    // Formulário de serviço
    function openServiceForm(serviceId = null) {
        document.getElementById('serviceFormTitle').textContent = serviceId ? 'Editar Serviço' : 'Adicionar Serviço';
        serviceForm.style.display = 'block';
        
        if (serviceId) {
            loadServiceData(serviceId);
        } else {
            serviceFormElement.reset();
            document.getElementById('serviceId').value = '';
        }
    }

    // Carregar dados do serviço para edição
    async function loadServiceData(serviceId) {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', serviceId)
                .single();
            
            if (error) throw error;
            
            if (data) {
                document.getElementById('serviceId').value = data.id;
                document.getElementById('serviceName').value = data.name;
                document.getElementById('serviceDescription').value = data.description;
                document.getElementById('servicePrice').value = data.price;
                document.getElementById('serviceIcon').value = data.icon || '';
            }
        } catch (error) {
            console.error('Erro ao carregar dados do serviço:', error);
        }
    }

    function closeServiceForm() {
        serviceForm.style.display = 'none';
    }

    // Enviar formulário de veículo
    async function handleVehicleSubmit(e) {
        e.preventDefault();
        
        const vehicleData = {
            model: document.getElementById('vehicleModel').value,
            brand: document.getElementById('vehicleBrand').value,
            year: parseInt(document.getElementById('vehicleYear').value),
            price: parseFloat(document.getElementById('vehiclePrice').value),
            image: document.getElementById('vehicleImage').value,
            description: document.getElementById('vehicleDescription').value
        };
        
        const vehicleId = document.getElementById('vehicleId').value;
        
        try {
            if (vehicleId) {
                // Atualizar veículo existente
                const { data, error } = await supabase
                    .from('vehicles')
                    .update(vehicleData)
                    .eq('id', vehicleId);
                
                if (error) throw error;
                alert('Veículo atualizado com sucesso!');
            } else {
                // Criar novo veículo
                const { data, error } = await supabase
                    .from('vehicles')
                    .insert([vehicleData]);
                
                if (error) throw error;
                alert('Veículo adicionado com sucesso!');
            }
            
            closeVehicleForm();
            loadVehicles();
        } catch (error) {
            console.error('Erro ao salvar veículo:', error);
            alert('Erro ao salvar veículo: ' + error.message);
        }
    }

    // Enviar formulário de serviço
    async function handleServiceSubmit(e) {
        e.preventDefault();
        
        const serviceData = {
            name: document.getElementById('serviceName').value,
            description: document.getElementById('serviceDescription').value,
            price: parseFloat(document.getElementById('servicePrice').value),
            icon: document.getElementById('serviceIcon').value
        };
        
        const serviceId = document.getElementById('serviceId').value;
        
        try {
            if (serviceId) {
                // Atualizar serviço existente
                const { data, error } = await supabase
                    .from('services')
                    .update(serviceData)
                    .eq('id', serviceId);
                
                if (error) throw error;
                alert('Serviço atualizado com sucesso!');
            } else {
                // Criar novo serviço
                const { data, error } = await supabase
                    .from('services')
                    .insert([serviceData]);
                
                if (error) throw error;
                alert('Serviço adicionado com sucesso!');
            }
            
            closeServiceForm();
            loadServices();
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            alert('Erro ao salvar serviço: ' + error.message);
        }
    }

    // Enviar formulário de contato
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
            
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
            e.target.reset();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem: ' + error.message);
        }
    }

    // Abrir modal de registro
    function openRegisterModal() {
        const email = prompt('Digite o email para criar conta admin:');
        const password = prompt('Digite a senha:');
        
        if (email && password) {
            registerUser(email, password);
        }
    }

    // Registrar usuário
    async function registerUser(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            if (data.user) {
                alert('Conta criada com sucesso! Verifique seu email para confirmação.');
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            alert('Erro: ' + error.message);
        }
    }

    // ========== CORREÇÃO: FUNÇÕES CRUD GLOBAIS ==========
    
    // Funções CRUD para veículos
    window.editVehicle = async function(id) {
        openVehicleForm(id);
    }

    window.deleteVehicle = async function(id) {
        if (confirm('Tem certeza que deseja excluir este veículo?')) {
            try {
                const { data, error } = await supabase
                    .from('vehicles')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                alert('Veículo excluído com sucesso!');
                loadVehicles();
            } catch (error) {
                console.error('Erro ao excluir veículo:', error);
                alert('Erro ao excluir veículo: ' + error.message);
            }
        }
    }

    // Funções CRUD para serviços
    window.editService = async function(id) {
        openServiceForm(id);
    }

    window.deleteService = async function(id) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                alert('Serviço excluído com sucesso!');
                loadServices();
            } catch (error) {
                console.error('Erro ao excluir serviço:', error);
                alert('Erro ao excluir serviço: ' + error.message);
            }
        }
    }

    // Funções CRUD para mensagens
    window.viewMessage = async function(id) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            if (data) {
                alert(`Mensagem de: ${data.name}\nEmail: ${data.email}\nAssunto: ${data.subject}\n\nMensagem:\n${data.message}`);
            }
        } catch (error) {
            console.error('Erro ao carregar mensagem:', error);
        }
    }

    window.deleteMessage = async function(id) {
        if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                alert('Mensagem excluída com sucesso!');
                loadMessages();
            } catch (error) {
                console.error('Erro ao excluir mensagem:', error);
                alert('Erro ao excluir mensagem: ' + error.message);
            }
        }
    }

    // ========== FIM DA CORREÇÃO ==========

    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModalFunc();
        }
    });

    // Criar admin (função para executar no console)
    window.createAdmin = createAdmin;

    // Adicionar função de debug
    window.debugAuth = function() {
        console.log('=== 🔍 DEBUG AUTH ===');
        console.log('isLoggedIn:', isLoggedIn);
        console.log('currentUser:', currentUser);
        console.log('adminPanel display:', adminPanel.style.display);
        console.log('adminBtn display:', adminBtn.style.display);
        console.log('loginBtn text:', loginBtn.textContent);
        console.log('====================');
    };

    // Testar conexão com Supabase
    window.testConnection = async function() {
        console.log('🔌 Testando conexão com Supabase...');
        try {
            const { data, error } = await supabase.from('vehicles').select('count');
            if (error) throw error;
            console.log('✅ Conexão com Supabase OK');
        } catch (error) {
            console.error('❌ Erro na conexão com Supabase:', error);
        }
    };