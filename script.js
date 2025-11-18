document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica de Traducción ---
    const langToggle = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('lang') || 'en';

    const translations = {
        "nav_about": { "en": "About", "es": "Sobre Mí" },
        "nav_experience": { "en": "Experience", "es": "Experiencia" },
        "nav_projects": { "en": "Projects", "es": "Proyectos" },
        "nav_contact": { "en": "Contact", "es": "Contacto" },
        "hero_title": { "en": "Osniel Cebrero Arcos", "es": "Osniel Cebrero Arcos" },
        "hero_subtitle": { "en": "Infrastructure Administration & Support | Linux & Windows Environments", "es": "Administración y Soporte de Infraestructura | Entornos Linux y Windows" },
        "hero_btn_projects": { "en": "View My Projects", "es": "Ver Mis Proyectos" },
        "hero_btn_terminal": { "en": "Launch Terminal", "es": "Abrir Terminal" },
        "hero_btn_cv": { "en": "Download Curriculum", "es": "Descargar Currículum" },
        "about_title": { "en": '<i class="fa-solid fa-user-tie"></i> About Me', "es": '<i class="fa-solid fa-user-tie"></i> Sobre Mí' },
        "about_subtitle1": { "en": "Professional Profile", "es": "Perfil Profesional" },
        "about_p": { "en": "Experienced professional in administration and support of infrastructure in Linux and Windows environments. Focused on task automation, database management, and corporate email platform administration. Skilled in application deployment, report generation, and system monitoring, contributing to operational continuity and technological process improvement.", "es": "Experimentado profesional en administración y soporte de infraestructura en entornos Linux y Windows. Enfocado en la automatización de tareas, gestión de bases de datos, y administración de plataformas de correo corporativo. Hábil en el despliegue de aplicaciones, generación de reportes, y monitoreo de sistemas, contribuyendo a la continuidad operativa y la mejora de procesos tecnológicos." },
        "about_subtitle2": { "en": '<i class="fa-solid fa-cogs"></i> Core Technologies', "es": '<i class="fa-solid fa-cogs"></i> Tecnologías Principales' },
        "exp_title": { "en": '<i class="fa-solid fa-briefcase"></i> Professional Experience', "es": '<i class="fa-solid fa-briefcase"></i> Experiencia Profesional' },
        "exp_job1_title": { "en": "Systems and Applications Administrator", "es": "Administrador de Sistemas y Aplicaciones" },
        "exp_job1_date": { "en": "Sept 2023 - Present | Universidad La Salle Oaxaca", "es": "Sept 2023 - Presente | Universidad La Salle Oaxaca" },
        "exp_job1_list": { "en": "<li>Administration of Linux and Windows Server (AD, DNS, DHCP).</li><li>Task automation using Bash and PowerShell (backups, user management, monitoring).</li><li>PostgreSQL database management: installation, backup, optimization, and queries.</li><li>Creation of dashboards in Power BI and operational reports using Report Builder (SSRS).</li><li>Infrastructure monitoring using Zabbix: agents, items, triggers, and alerts.</li><li>Implementation of Google Workspace with Single Sign-On (SSO) authentication using SAML.</li>", "es": "<li>Administración de Linux y Windows Server (AD, DNS, DHCP).</li><li>Automatización de tareas con Bash y PowerShell (backups, gestión de usuarios, monitoreo).</li><li>Gestión de bases de datos PostgreSQL: instalación, respaldo, optimización y consultas.</li><li>Creación de dashboards en Power BI y reportes operativos usando Report Builder (SSRS).</li><li>Monitoreo de infraestructura usando Zabbix: agentes, items, triggers y alertas.</li><li>Implementación de Google Workspace con autenticación Single Sign-On (SSO) usando SAML.</li>" },
        "exp_job2_title": { "en": "Independent Consultant", "es": "Consultor Independiente" },
        "exp_job2_date": { "en": "2024 | G10 Asesores Empresariales S.A. de C.V.", "es": "2024 | G10 Asesores Empresariales S.A. de C.V." },
        "exp_job2_list": { "en": "<li>Task automation using Bash scripting for deployment processes.</li><li>Adjustments and maintenance of the testing environment, including service configuration and error resolution in Linux environments.</li>", "es": "<li>Automatización de tareas usando Bash scripting para procesos de despliegue.</li><li>Ajustes y mantenimiento del ambiente de pruebas, incluyendo configuración de servicios y resolución de errores en entornos Linux.</li>" },
        "exp_job3_title": { "en": "Intern", "es": "Practicas profesionales" },
        "exp_job3_date": { "en": "June 2022 - Nov 2022 | Fundación Alfredo Harp Helú Oaxаса", "es": "Jun 2022 - Nov 2022 | Fundación Alfredo Harp Helú Oaxаса" },
        "exp_job3_list": { "en": "<li>Assigned to the digital affairs committee, supported web design, maintenance, logistics, and technical support... using Bootstrap and a cloud-based development environment through Amazon Web Services instances.</li>", "es": "<li>Asignado al comité de asuntos digitales, apoyó en diseño web, mantenimiento, logística y soporte técnico... usando Bootstrap y un entorno de desarrollo en la nube a través de instancias de Amazon Web Services.</li>" },
        "proj_title": { "en": '<i class="fa-solid fa-laptop-code"></i> Featured Projects', "es": '<i class="fa-solid fa-laptop-code"></i> Proyectos Destacados' },
        "proj_1_title": { "en": "Google Workspace SSO Implementation", "es": "Implementación de SSO en Google Workspace" },
        "proj_1_desc": { "en": "Led the implementation of Google Workspace with Single Sign-On (SSO) authentication using SAML, integrated with email clients like Outlook to ensure interoperability.", "es": "Lideré la implementación de Google Workspace con autenticación Single Sign-On (SSO) usando SAML, integrado con clientes de correo como Outlook para asegurar la interoperabilidad." },
        "proj_2_title": { "en": "Automation & Monitoring Solutions", "es": "Soluciones de Automatización y Monitoreo" },
        "proj_2_desc": { "en": "Developed and deployed scripts in Bash and PowerShell for automating critical tasks like backups and user management. Configured Zabbix monitoring with custom agents, items, and triggers.", "es": "Desarrollé y desplegué scripts en Bash y PowerShell para automatizar tareas críticas como backups y gestión de usuarios. Configuré monitoreo con Zabbix, incluyendo agentes, items y triggers." },
        "proj_3_title": { "en": "BI Dashboards & Reporting", "es": "Dashboards BI y Reportes" },
        "proj_3_desc": { "en": "Created operational dashboards in Power BI and custom reports using Report Builder (SSRS) to provide actionable insights from PostgreSQL and SQL Server databases.", "es": "Creé dashboards operativos en Power BI y reportes personalizados usando Report Builder (SSRS) para proveer información accionable desde bases de datos PostgreSQL." },
        "proj_4_title": { "en": "Linux RAID & Samba Server", "es": "Servidor RAID y Samba en Linux" },
        "proj_4_desc": { "en": "Configured a software RAID 1 (mirroring) on a Linux server for data redundancy. Deployed and managed a Samba server for secure, cross-platform file sharing.", "es": "Configuré un RAID 1 por software (espejo) en un servidor Linux para redundancia de datos. Desplegué y administré un servidor Samba para compartir archivos de forma segura y multiplataforma." },
        "cert_title": { "en": '<i class="fa-solid fa-award"></i> Certifications', "es": '<i class="fa-solid fa-award"></i> Certificaciones' },
        "contact_title": { "en": '<i class="fa-solid fa-envelope"></i> Get In Touch', "es": '<i class="fa-solid fa-envelope"></i> Contacto' },
        "contact_p": { "en": "I'm open to discussing new projects and opportunities. Let's connect!", "es": "Estoy abierto a discutir nuevos proyectos y oportunidades." },
        "footer_text": { "en": "&copy; 2025 Osniel Cebrero Arcos. All rights reserved.", "es": "&copy; 2025 Osniel Cebrero Arcos. Todos los derechos reservados." },
    };
    
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.dataset.key;
            if (translations[key] && translations[key][lang]) {
                el.innerHTML = translations[key][lang];
            }
        });

        langToggle.textContent = lang === 'en' ? 'ES' : 'EN';
    }

    langToggle.addEventListener('click', () => {
        const newLang = currentLang === 'en' ? 'es' : 'en';
        setLanguage(newLang);
    });

    // --- Lógica del Tema (Día/Noche) ---
    const themeToggle = document.getElementById('theme-toggle');
    let currentTheme = localStorage.getItem('theme') || 'light';

    function setTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    }

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        setTheme(newTheme);
    });

    // --- Lógica de la Terminal ---
    const terminalModal = document.getElementById('terminal-modal');
    const openTerminalBtn = document.getElementById('open-terminal-btn');
    const closeTerminalBtn = document.getElementById('terminal-close-btn');
    const commandInput = document.getElementById('terminal-command-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalBody = document.getElementById('terminal-body');

    const terminalCommands = {
        'en': {
            'help': `<div class="output-text"><b>Available commands:</b><ul><li><b>about</b> - Show my professional summary</li><li><b>experience</b> - List my professional experience</li><li><b>tech</b> - List my core technologies</li><li><b>contact</b> - Display my contact information</li><li><b>projects</b> - Show featured projects</li><li><b>clear</b> - Clear the terminal screen</li><li><b>exit</b> - Close the terminal window</li></ul></div>`,
            'about': `<div class="output-text"><h4>About Me</h4>${translations.about_p.en}</div>`,
            'experience': `<div class="output-text"><h4>Professional Experience</h4><b>Systems and Applications Administrator</b><em> (Sept 2023 - Present)</em><ul>${translations.exp_job1_list.en}</ul><b>Independent Consultant</b><em> (2024)</em><ul>${translations.exp_job2_list.en}</ul><b>Intern</b><em> (June 2022 - Nov 2022)</em><ul>${translations.exp_job3_list.en}</ul></div>`,
            'tech': `<div class="output-text"><h4>Core Technologies</h4><ul><li>Linux, Windows Server</li><li>Bash, PowerShell</li><li>PostgreSQL, MySQL</li><li>Power BI, SSRS, Zabbix</li><li>Docker, AWS, Git</li><li>Office 365 Admin</li><li>HTML5, CSS3, JavaScript</li></ul></div>`,
            'contact': `<div class="output-text"><h4>Contact Information</h4><ul><li><b>Location:</b> Oaxaca, México</li><li><b>Phone:</b> <a href="tel:+527441207246">+52 (744) 120-7246</a></li><li><b>Email:</b> <a href="mailto:osnielca@gmail.com">osnielca@gmail.com</a></li></ul></div>`,
            'projects': `<div class="output-text"><h4>Featured Projects</h4><b>1. ${translations.proj_1_title.en}</b><p>${translations.proj_1_desc.en}</p><b>2. ${translations.proj_2_title.en}</b><p>${translations.proj_2_desc.en}</p><b>3. ${translations.proj_4_title.en}</b><p>${translations.proj_4_desc.en}</p></div>`,
            'welcome': ``, // Ya no se usa
            'notFound': `Command not found: `
        },
        'es': {
            'help': `<div class="output-text"><b>Comandos disponibles:</b><ul><li><b>sobremi</b> - Muestra mi perfil profesional</li><li><b>experiencia</b> - Lista mi experiencia profesional</li><li><b>tech</b> - Lista mis tecnologías principales</li><li><b>contacto</b> - Muestra mi información de contacto</li><li><b>proyectos</b> - Muestra proyectos destacados</li><li><b>clear</b> - Limpia la pantalla de la terminal</li><li><b>exit</b> - Cierra la ventana de la terminal</li></ul></div>`,
            'sobremi': `<div class="output-text"><h4>Sobre Mí</h4>${translations.about_p.es}</div>`,
            'experiencia': `<div class="output-text"><h4>Experiencia Profesional</h4><b>Administrador de Sistemas y Aplicaciones</b><em> (Sept 2023 - Presente)</em><ul>${translations.exp_job1_list.es}</ul><b>Consultor Independiente</b><em> (2024)</em><ul>${translations.exp_job2_list.es}</ul><b>Practicas profesionales</b><em> (Jun 2022 - Nov 2022)</em><ul>${translations.exp_job3_list.es}</ul></div>`,
            'tech': `<div class="output-text"><h4>Tecnologías Principales</h4><ul><li>Linux, Windows Server</li><li>Bash, PowerShell</li><li>PostgreSQL, MySQL</li><li>Power BI, SSRS, Zabbix</li><li>Docker, AWS, Git</li><li>Office 365 Admin</li><li>HTML5, CSS3, JavaScript</li></ul></div>`,
            'contacto': `<div class="output-text"><h4>Información de Contacto</h4><ul><li><b>Ubicación:</b> Oaxaca, México</li><li><b>Teléfono:</b> <a href="tel:+527441207246">+52 (744) 120-7246</a></li><li><b>Email:</b> <a href="mailto:osnielca@gmail.com">osnielca@gmail.com</a></li></ul></div>`,
            'proyectos': `<div class="output-text"><h4>Proyectos Destacados</h4><b>1. ${translations.proj_1_title.es}</b><p>${translations.proj_1_desc.es}</p><b>2. ${translations.proj_2_title.es}</b><p>${translations.proj_2_desc.es}</p><b>3. ${translations.proj_4_title.es}</b><p>${translations.proj_4_desc.es}</p></div>`,
            'welcome': ``, // Ya no se usa
            'notFound': `Comando no encontrado: `
        }
    };
    
    // --- LÓGICA DE ANIMACIÓN (MOTD) ---
    let isAutoScriptRunning = false;
    let commandHistory = []; 
    let historyIndex = -1;  

    // 1. Arte ASCII
    const introAscii = `<span class="output-command">  ___            _      _ \n / _ \\ ___ _ __ (_) ___| |\n| | | / __| \'_ \\| |/ _ \\ |\n| |_| \\__ \\ | | | |  __/ |\n \\___/|___/_| |_|_|\\___|_|</span>`;

    // 2. Mensaje del día
    const introMotd = [
        " ",
        "Osniel portfolio 6.1.0-18-amd64",
        "Last login: " + new Date().toString(), // Fecha y hora actual
        "Booting 'Osniel.Portfolio.v2.5'...",
        "Connecting to: <b>osniel@cloud-server</b>...",
        "<b>Authentication successful.</b>",
        " "
    ];

    // 3. Función de Pausa
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 4. Función para añadir líneas a la terminal
    function addTerminalLine(html) {
        const p = document.createElement('p');
        p.classList.add('output-text'); 
        p.innerHTML = html;
        terminalOutput.appendChild(p);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // 5. Función principal de la animación
    async function runIntroAnimation() {
        isAutoScriptRunning = true;
        commandInput.disabled = true;
        terminalOutput.innerHTML = ''; 
        

        addTerminalLine(introAscii); 
        await delay(100); // Una pequeña pausa después del arte

        for (const line of introMotd) {
            addTerminalLine(line);
            await delay(100); // 100ms por línea
        }

        //Mostrar comandos (usando el idioma actual)
        const helpMessage = terminalCommands[currentLang].help;
        addTerminalLine(helpMessage);
        addTerminalLine(" "); // Espacio extra

        isAutoScriptRunning = false;
        commandInput.disabled = false;
        commandInput.focus(); // Enfocar el input
    }


    // --- MODIFICACIÓN DEL 'click' ---
    openTerminalBtn.addEventListener('click', () => {
        terminalModal.style.display = 'flex';
        runIntroAnimation(); // Ejecuta la nueva animación
    });

    closeTerminalBtn.addEventListener('click', () => {
        terminalModal.style.display = 'none';
    });
    terminalModal.addEventListener('click', (e) => {
        if (e.target === terminalModal) terminalModal.style.display = 'none';
    });

    commandInput.addEventListener('keydown', (e) => {
        if (isAutoScriptRunning) e.preventDefault(); 

        if (e.key === 'Enter') {
            e.preventDefault();
            const command = commandInput.value.trim().toLowerCase();
            commandInput.value = '';

            if (command) {
                commandHistory.unshift(command); 
                historyIndex = -1; 
            }

            const commandElement = document.createElement('div');
            commandElement.classList.add('output-command');
            commandElement.innerHTML = `<span class="prompt">osniel@cloud-server:~$</span> <strong>${command}</strong>`;
            terminalOutput.appendChild(commandElement);

            const commands = terminalCommands[currentLang];

            if (command === 'clear') {
                terminalOutput.innerHTML = ''; 
                
            } else if (command === 'exit') {
                terminalModal.style.display = 'none';
            } else if (commands[command]) {
                const outputElement = document.createElement('div');
                outputElement.innerHTML = commands[command];
                terminalOutput.appendChild(outputElement);
            } else {
                const errorElement = document.createElement('div');
                errorElement.classList.add('error-message');
                errorElement.textContent = commands.notFound + command;
                terminalOutput.appendChild(errorElement);
            }
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.value = commandHistory[historyIndex];
                commandInput.selectionStart = commandInput.selectionEnd = commandInput.value.length;
            }
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.value = commandHistory[historyIndex];
            } else if (historyIndex === 0) {
                historyIndex = -1;
                commandInput.value = '';
            }
        }
    });

    terminalBody.addEventListener('click', () => {
        if (!isAutoScriptRunning) commandInput.focus();
    });


    // --- LÓGICA DE ANIMACIÓN DE SCROLL ---
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 
    });

    revealElements.forEach((el, index) => {
        if (el.parentElement.classList.contains('skills-grid')) {
            el.style.setProperty('--i', index);
        }
        observer.observe(el);
    });

    // --- LÓGICA DE NAVBAR SCROLLED ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Carga Inicial ---
    setTheme(currentTheme);
    setLanguage(currentLang);
});