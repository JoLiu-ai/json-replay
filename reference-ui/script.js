document.addEventListener('DOMContentLoaded', () => {
    const timelineBtn = document.getElementById('timeline-btn');
    const parallelBtn = document.getElementById('parallel-btn');
    const timelineView = document.getElementById('timeline-view');
    const parallelView = document.getElementById('parallel-view');
    const chatTitle = document.getElementById('chat-title');

    let conversationData = null;
    let network = null;

    // View switcher logic
    timelineBtn.addEventListener('click', () => {
        switchView('timeline');
    });

    parallelBtn.addEventListener('click', () => {
        switchView('parallel');
        // Initialize network graph only when the view is active and it hasn't been created yet
        if (!network) {
            renderParallelView(conversationData);
        }
    });

    function switchView(viewName) {
        if (viewName === 'timeline') {
            timelineView.classList.add('active');
            parallelView.classList.remove('active');
            timelineBtn.classList.add('active');
            parallelBtn.classList.remove('active');
        } else {
            timelineView.classList.remove('active');
            parallelView.classList.add('active');
            timelineBtn.classList.remove('active');
            parallelBtn.classList.add('active');
        }
    }

    // Fetch and process data
    async function loadConversation() {
        try {
            const response = await fetch('AdvancedRAGTechniques_LlamaIndex/a-1/agentic_rag/a.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            conversationData = await response.json();
            chatTitle.textContent = conversationData.title;
            renderTimelineView(conversationData);
        } catch (error) {
            console.error("Failed to load or parse conversation data:", error);
            timelineView.innerHTML = `<p>Error loading conversation data. Please check the console.</p>`;
        }
    }

    // Render Timeline View
    function renderTimelineView(data) {
        const { mapping } = data;
        const rootId = 'client-created-root';
        const rootNode = mapping[rootId];

        timelineView.innerHTML = ''; // Clear previous content

        if (rootNode && rootNode.children) {
            rootNode.children.forEach(childId => {
                const childHtml = buildTimelineNode(childId, mapping, 0);
                timelineView.appendChild(childHtml);
            });
        }
    }

    function buildTimelineNode(nodeId, mapping, depth) {
        const nodeData = mapping[nodeId];
        if (!nodeData || !nodeData.message) {
            return document.createElement('div'); // Return an empty div if node is invalid
        }

        const container = document.createElement('div');
        if (depth > 0) {
            container.classList.add('message-container');
            container.style.marginLeft = `${depth * 20}px`;
        }

        const card = document.createElement('div');
        card.classList.add('message-card', nodeData.message.author.role);

        const author = document.createElement('div');
        author.classList.add('author');
        author.textContent = nodeData.message.author.role === 'user' ? 'L (User)' : 'J (Assistant)';
         if (nodeData.message.author.role === 'system') author.textContent = 'System';


        const timestamp = document.createElement('div');
        timestamp.classList.add('timestamp');
        timestamp.textContent = nodeData.message.create_time ? new Date(nodeData.message.create_time * 1000).toLocaleString() : 'No timestamp';

        const content = document.createElement('div');
        content.classList.add('content');
        
        const contentText = nodeData.message.content.parts.join('');
        
        // Handle <thinking> blocks
        if (contentText.includes('<thinking>')) {
            const thinkingMatch = contentText.match(/<thinking>([\s\S]*?)<\/thinking>/);
            const answerMatch = contentText.match(/<answer>([\s\S]*?)<\/answer>/);

            if(thinkingMatch) {
                const details = document.createElement('details');
                const summary = document.createElement('summary');
                summary.textContent = 'Show thinking process';
                const thinkingContent = document.createElement('p');
                thinkingContent.textContent = thinkingMatch[1].trim();
                details.appendChild(summary);
                details.appendChild(thinkingContent);
                content.appendChild(details);
            }
            
            if(answerMatch){
                 const answerContent = document.createElement('p');
                 answerContent.textContent = answerMatch[1].trim();
                 content.appendChild(answerContent);
            }

        } else {
             const text = document.createElement('p');
             text.textContent = contentText;
             content.appendChild(text);
        }


        card.appendChild(author);
        card.appendChild(timestamp);
        card.appendChild(content);
        container.appendChild(card);
        
        if (nodeData.children && nodeData.children.length > 0) {
            nodeData.children.forEach(childId => {
                const childNode = buildTimelineNode(childId, mapping, depth + 1);
                container.appendChild(childNode);
            });
        }
        
        return container;
    }


    // Render Parallel View
    function renderParallelView(data) {
        const { mapping } = data;
        const nodes = [];
        const edges = [];
        
        Object.keys(mapping).forEach(nodeId => {
            const nodeData = mapping[nodeId];
            if (nodeData && nodeData.message) {
                const role = nodeData.message.author.role;
                let label = role;
                if(role === 'user') label = 'L';
                if(role === 'assistant') label = 'J';

                nodes.push({
                    id: nodeId,
                    label: label,
                    title: nodeData.message.content.parts.join('').substring(0, 100) + '...', // Tooltip
                    color: getRoleColor(role)
                });

                if (nodeData.parent) {
                    edges.push({
                        from: nodeData.parent,
                        to: nodeId
                    });
                }
            }
        });
        
        const container = document.getElementById('parallel-view');
        const graphData = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges),
        };
        const options = {
            layout: {
                hierarchical: {
                    direction: "UD", // Up-Down
                    sortMethod: "directed",
                    levelSeparation: 150,
                },
            },
            edges: {
                arrows: 'to',
                smooth: true,
            },
            physics: false, // Disable physics for a static hierarchical layout
        };

        network = new vis.Network(container, graphData, options);
    }

    function getRoleColor(role) {
        switch (role) {
            case 'user':
                return '#e1f5fe';
            case 'assistant':
                return '#e8f5e9';
            case 'system':
                return '#f5f5f5';
            default:
                return '#ddd';
        }
    }


    // Initial load
    loadConversation();
}); 