/*
===========================================
KRISHYASETU GALLERY FUNCTIONALITY
===========================================
Complete gallery with image management and viewing
===========================================
*/

class GalleryFunctional {
    constructor() {
        this.images = [];
        this.currentImageIndex = 0;
        this.viewMode = 'grid'; // grid, list, slideshow
        this.sortBy = 'date'; // date, name, size
        this.filterBy = 'all'; // all, images, videos, documents
    }

    // Open gallery with full functionality
    openGallery() {
        this.createGalleryModal();
        this.loadStoredImages();
        this.bindGalleryEvents();
    }

    // Create gallery modal
    createGalleryModal() {
        const galleryHTML = `
            <div class="gallery-functional-modal" id="gallery-functional-modal">
                <div class="gallery-functional-overlay"></div>
                <div class="gallery-functional-content">
                    <div class="gallery-header">
                        <h3>Gallery</h3>
                        <div class="gallery-controls">
                            <button class="btn btn-sm btn-secondary" id="gallery-upload-btn">
                                <i class="fas fa-upload"></i> Upload
                            </button>
                            <button class="btn btn-sm btn-secondary" id="gallery-select-btn">
                                <i class="fas fa-check-square"></i> Select
                            </button>
                            <button class="btn btn-sm btn-secondary gallery-close-btn" id="close-gallery-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="gallery-toolbar">
                        <div class="toolbar-section">
                            <div class="view-modes">
                                <button class="btn btn-sm btn-secondary view-mode-btn active" data-view="grid">
                                    <i class="fas fa-th"></i>
                                </button>
                                <button class="btn btn-sm btn-secondary view-mode-btn" data-view="list">
                                    <i class="fas fa-list"></i>
                                </button>
                                <button class="btn btn-sm btn-secondary view-mode-btn" data-view="slideshow">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="toolbar-section">
                            <div class="sort-options">
                                <select id="sort-select" class="form-select">
                                    <option value="date">Sort by Date</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="size">Sort by Size</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="toolbar-section">
                            <div class="filter-options">
                                <select id="filter-select" class="form-select">
                                    <option value="all">All Files</option>
                                    <option value="images">Images Only</option>
                                    <option value="videos">Videos Only</option>
                                    <option value="documents">Documents Only</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="toolbar-section">
                            <div class="search-box">
                                <input type="text" id="gallery-search" placeholder="Search gallery..." class="form-input">
                                <button class="btn btn-sm btn-secondary" id="search-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="gallery-stats" id="gallery-stats">
                        <span class="stat-item">
                            <i class="fas fa-images"></i>
                            <span id="image-count">0</span> Images
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-video"></i>
                            <span id="video-count">0</span> Videos
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-file"></i>
                            <span id="document-count">0</span> Documents
                        </span>
                    </div>
                    
                    <div class="gallery-body">
                        <div class="gallery-container" id="gallery-container">
                            <div class="loading-state">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Loading gallery...</p>
                            </div>
                        </div>
                        
                        <div class="gallery-sidebar" id="gallery-sidebar" style="display: none;">
                            <div class="sidebar-content">
                                <div class="image-details" id="image-details">
                                    <h4>Image Details</h4>
                                    <div class="detail-item">
                                        <span class="detail-label">Name:</span>
                                        <span class="detail-value" id="detail-name">-</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Size:</span>
                                        <span class="detail-value" id="detail-size">-</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Date:</span>
                                        <span class="detail-value" id="detail-date">-</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Type:</span>
                                        <span class="detail-value" id="detail-type">-</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Dimensions:</span>
                                        <span class="detail-value" id="detail-dimensions">-</span>
                                    </div>
                                </div>
                                
                                <div class="image-actions" id="image-actions">
                                    <h4>Actions</h4>
                                    <div class="action-buttons">
                                        <button class="btn btn-secondary btn-block" id="view-fullscreen-btn">
                                            <i class="fas fa-expand"></i> View Fullscreen
                                        </button>
                                        <button class="btn btn-secondary btn-block" id="edit-image-btn">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-secondary btn-block" id="share-image-btn">
                                            <i class="fas fa-share"></i> Share
                                        </button>
                                        <button class="btn btn-secondary btn-block" id="download-image-btn">
                                            <i class="fas fa-download"></i> Download
                                        </button>
                                        <button class="btn btn-error btn-block" id="delete-image-btn">
                                            <i class="fas fa-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', galleryHTML);
    }

    // Load stored images from localStorage
    loadStoredImages() {
        const storedImages = localStorage.getItem('galleryImages');
        if (storedImages) {
            this.images = JSON.parse(storedImages);
        } else {
            this.images = this.getDefaultImages();
        }
        
        this.renderGallery();
        this.updateStats();
    }

    // Get default sample images
    getDefaultImages() {
        return [
            {
                id: 1,
                name: 'sample1.jpg',
                src: 'https://picsum.photos/300/200?random=1',
                type: 'image',
                size: 45678,
                date: new Date('2024-01-15').toISOString(),
                dimensions: '300x200'
            },
            {
                id: 2,
                name: 'sample2.jpg',
                src: 'https://picsum.photos/300/200?random=2',
                type: 'image',
                size: 34567,
                date: new Date('2024-01-14').toISOString(),
                dimensions: '300x200'
            },
            {
                id: 3,
                name: 'sample3.jpg',
                src: 'https://picsum.photos/300/200?random=3',
                type: 'image',
                size: 56789,
                date: new Date('2024-01-13').toISOString(),
                dimensions: '300x200'
            }
        ];
    }

    // Render gallery based on current view mode
    renderGallery() {
        const container = document.getElementById('gallery-container');
        const filteredImages = this.getFilteredImages();
        const sortedImages = this.getSortedImages(filteredImages);
        
        switch(this.viewMode) {
            case 'grid':
                this.renderGridView(container, sortedImages);
                break;
            case 'list':
                this.renderListView(container, sortedImages);
                break;
            case 'slideshow':
                this.renderSlideshowView(container, sortedImages);
                break;
        }
        
        this.bindImageEvents();
    }

    // Render grid view
    renderGridView(container, images) {
        const gridHTML = images.map(image => `
            <div class="gallery-item grid-item" data-image-id="${image.id}">
                <div class="item-image">
                    <img src="${image.src}" alt="${image.name}" loading="lazy">
                    <div class="item-overlay">
                        <div class="overlay-actions">
                            <button class="btn btn-sm btn-secondary" data-action="view">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" data-action="select">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="item-info">
                    <div class="item-name">${image.name}</div>
                    <div class="item-meta">
                        <span class="item-size">${this.formatFileSize(image.size)}</span>
                        <span class="item-date">${this.formatDate(image.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `<div class="gallery-grid">${gridHTML}</div>`;
    }

    // Render list view
    renderListView(container, images) {
        const listHTML = images.map(image => `
            <div class="gallery-item list-item" data-image-id="${image.id}">
                <div class="list-content">
                    <div class="list-thumbnail">
                        <img src="${image.src}" alt="${image.name}">
                    </div>
                    <div class="list-info">
                        <div class="list-name">${image.name}</div>
                        <div class="list-details">
                            <span class="list-size">${this.formatFileSize(image.size)}</span>
                            <span class="list-date">${this.formatDate(image.date)}</span>
                            <span class="list-dimensions">${image.dimensions}</span>
                        </div>
                        <div class="list-actions">
                            <button class="btn btn-sm btn-secondary" data-action="view">View</button>
                            <button class="btn btn-sm btn-secondary" data-action="edit">Edit</button>
                            <button class="btn btn-sm btn-secondary" data-action="share">Share</button>
                            <button class="btn btn-sm btn-secondary" data-action="download">Download</button>
                            <button class="btn btn-sm btn-error" data-action="delete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `<div class="gallery-list">${listHTML}</div>`;
    }

    // Render slideshow view
    renderSlideshowView(container, images) {
        if (images.length === 0) return;
        
        const currentImage = images[this.currentImageIndex];
        const slideshowHTML = `
            <div class="slideshow-container">
                <div class="slideshow-main">
                    <img src="${currentImage.src}" alt="${currentImage.name}" id="slideshow-image">
                    <div class="slideshow-controls">
                        <button class="btn btn-secondary slideshow-btn" id="slideshow-prev">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="btn btn-secondary slideshow-btn" id="slideshow-play-pause">
                            <i class="fas fa-pause"></i>
                        </button>
                        <button class="btn btn-secondary slideshow-btn" id="slideshow-next">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="slideshow-info">
                    <div class="slideshow-counter">
                        <span>${this.currentImageIndex + 1}</span> / <span>${images.length}</span>
                    </div>
                    <div class="slideshow-details">
                        <div class="detail-name">${currentImage.name}</div>
                        <div class="detail-meta">
                            <span>${this.formatFileSize(currentImage.size)}</span>
                            <span>${this.formatDate(currentImage.date)}</span>
                            <span>${currentImage.dimensions}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = slideshowHTML;
        this.startSlideshow();
    }

    // Get filtered images
    getFilteredImages() {
        const searchTerm = document.getElementById('gallery-search').value.toLowerCase();
        const filterType = document.getElementById('filter-select').value;
        
        return this.images.filter(image => {
            // Apply text filter
            if (searchTerm && !image.name.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            // Apply type filter
            if (filterType !== 'all' && image.type !== filterType) {
                return false;
            }
            
            return true;
        });
    }

    // Get sorted images
    getSortedImages(images) {
        const sortBy = document.getElementById('sort-select').value;
        
        return [...images].sort((a, b) => {
            switch(sortBy) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return b.size - a.size;
                default:
                    return 0;
            }
        });
    }

    // Bind image events
    bindImageEvents() {
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                const imageId = item.dataset.imageId;
                const image = this.images.find(img => img.id == imageId);
                
                if (action && image) {
                    this.handleImageAction(action, image);
                } else if (image) {
                    this.viewImage(image);
                }
            });
        });
        
        // Slideshow controls
        if (this.viewMode === 'slideshow') {
            this.bindSlideshowEvents();
        }
    }

    // Handle image actions
    handleImageAction(action, image) {
        switch(action) {
            case 'view':
                this.viewImage(image);
                break;
            case 'edit':
                this.editImage(image);
                break;
            case 'share':
                this.shareImage(image);
                break;
            case 'download':
                this.downloadImage(image);
                break;
            case 'delete':
                this.deleteImage(image.id);
                break;
            case 'select':
                this.toggleImageSelection(image.id);
                break;
        }
    }

    // View image in detail
    viewImage(image) {
        this.showImageDetails(image);
        document.getElementById('gallery-sidebar').style.display = 'block';
    }

    // Show image details in sidebar
    showImageDetails(image) {
        document.getElementById('detail-name').textContent = image.name;
        document.getElementById('detail-size').textContent = this.formatFileSize(image.size);
        document.getElementById('detail-date').textContent = this.formatDate(image.date);
        document.getElementById('detail-type').textContent = image.type;
        document.getElementById('detail-dimensions').textContent = image.dimensions;
        
        // Bind sidebar action buttons
        this.bindSidebarActions(image);
    }

    // Bind sidebar action buttons
    bindSidebarActions(image) {
        document.getElementById('view-fullscreen-btn').onclick = () => this.viewFullscreen(image);
        document.getElementById('edit-image-btn').onclick = () => this.editImage(image);
        document.getElementById('share-image-btn').onclick = () => this.shareImage(image);
        document.getElementById('download-image-btn').onclick = () => this.downloadImage(image);
        document.getElementById('delete-image-btn').onclick = () => this.deleteImage(image.id);
    }

    // View image fullscreen
    viewFullscreen(image) {
        const fullscreenHTML = `
            <div class="fullscreen-viewer" id="fullscreen-viewer">
                <div class="fullscreen-overlay"></div>
                <div class="fullscreen-content">
                    <img src="${image.src}" alt="${image.name}">
                    <button class="fullscreen-close" id="close-fullscreen">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', fullscreenHTML);
        
        document.getElementById('close-fullscreen').addEventListener('click', () => {
            document.getElementById('fullscreen-viewer').remove();
        });
        
        document.querySelector('.fullscreen-overlay').addEventListener('click', () => {
            document.getElementById('fullscreen-viewer').remove();
        });
    }

    // Edit image
    editImage(image) {
        // Integration with image editor
        this.showNotification('Opening image editor...', 'info');
        // Would open image editing modal
    }

    // Share image
    async shareImage(image) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: image.name,
                    text: `Check out this image: ${image.name}`,
                    url: image.src
                });
            } catch (error) {
                this.copyToClipboard(image.src);
            }
        } else {
            this.copyToClipboard(image.src);
        }
    }

    // Copy to clipboard
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Link copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy link', 'error');
        });
    }

    // Download image
    downloadImage(image) {
        const a = document.createElement('a');
        a.href = image.src;
        a.download = image.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.showNotification('Image downloaded', 'success');
    }

    // Delete image
    deleteImage(imageId) {
        if (confirm('Are you sure you want to delete this image?')) {
            this.images = this.images.filter(img => img.id != imageId);
            this.saveToLocalStorage();
            this.renderGallery();
            this.updateStats();
            this.showNotification('Image deleted', 'success');
        }
    }

    // Switch view mode
    switchViewMode(mode) {
        this.viewMode = mode;
        
        // Update active button
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${mode}"]`).classList.add('active');
        
        this.renderGallery();
    }

    // Toggle selection mode
    toggleSelectionMode() {
        const gallery = document.getElementById('gallery-container');
        const isInSelectionMode = gallery.classList.contains('selection-mode');
        
        if (isInSelectionMode) {
            gallery.classList.remove('selection-mode');
            document.getElementById('gallery-select-btn').innerHTML = '<i class="fas fa-check-square"></i> Select';
        } else {
            gallery.classList.add('selection-mode');
            document.getElementById('gallery-select-btn').innerHTML = '<i class="fas fa-check-square"></i> Cancel';
        }
    }

    // Toggle image selection
    toggleImageSelection(imageId) {
        const item = document.querySelector(`[data-image-id="${imageId}"]`);
        if (item) {
            item.classList.toggle('selected');
        }
    }

    // Bind slideshow events
    bindSlideshowEvents() {
        document.getElementById('slideshow-prev').addEventListener('click', () => {
            this.previousImage();
        });
        
        document.getElementById('slideshow-next').addEventListener('click', () => {
            this.nextImage();
        });
        
        document.getElementById('slideshow-play-pause').addEventListener('click', () => {
            this.toggleSlideshow();
        });
    }

    // Start slideshow
    startSlideshow() {
        this.slideshowInterval = setInterval(() => {
            this.nextImage();
        }, 3000); // Change image every 3 seconds
        this.isSlideshowPlaying = true;
        this.updateSlideshowButton();
    }

    // Stop slideshow
    stopSlideshow() {
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
        }
        this.isSlideshowPlaying = false;
        this.updateSlideshowButton();
    }

    // Toggle slideshow
    toggleSlideshow() {
        if (this.isSlideshowPlaying) {
            this.stopSlideshow();
        } else {
            this.startSlideshow();
        }
    }

    // Update slideshow button
    updateSlideshowButton() {
        const btn = document.getElementById('slideshow-play-pause');
        if (this.isSlideshowPlaying) {
            btn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    // Previous image
    previousImage() {
        const filteredImages = this.getFilteredImages();
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
        } else {
            this.currentImageIndex = filteredImages.length - 1;
        }
        this.renderGallery();
    }

    // Next image
    nextImage() {
        const filteredImages = this.getFilteredImages();
        if (this.currentImageIndex < filteredImages.length - 1) {
            this.currentImageIndex++;
        } else {
            this.currentImageIndex = 0;
        }
        this.renderGallery();
    }

    // Update statistics
    updateStats() {
        const images = this.images.filter(img => img.type === 'image');
        const videos = this.images.filter(img => img.type === 'video');
        const documents = this.images.filter(img => img.type === 'document');
        
        document.getElementById('image-count').textContent = images.length;
        document.getElementById('video-count').textContent = videos.length;
        document.getElementById('document-count').textContent = documents.length;
    }

    // Save to localStorage
    saveToLocalStorage() {
        localStorage.setItem('galleryImages', JSON.stringify(this.images));
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = `
            <div class="gallery-notification ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', notification);
        
        setTimeout(() => {
            const notif = document.querySelector('.gallery-notification');
            if (notif) notif.remove();
        }, 3000);
    }

    // Close gallery
    closeGallery() {
        if (this.slideshowInterval) {
            this.stopSlideshow();
        }
        
        const modal = document.getElementById('gallery-functional-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    // Bind gallery events
    bindGalleryEvents() {
        // Close gallery
        document.getElementById('close-gallery-btn').addEventListener('click', () => {
            this.closeGallery();
        });
        
        // Upload button
        document.getElementById('gallery-upload-btn').addEventListener('click', () => {
            if (window.fileManager) {
                window.fileManager.openFileManager();
            }
        });
        
        // Image action buttons
        document.getElementById('download-image-btn')?.addEventListener('click', () => {
            if (this.currentImage) {
                const link = document.createElement('a');
                link.href = this.currentImage.src;
                link.download = `gallery-image-${Date.now()}.jpg`;
                link.click();
                if (window.toast) window.toast.success('Image downloaded successfully');
            }
        });
        
        document.getElementById('delete-image-btn')?.addEventListener('click', () => {
            if (this.currentImage && confirm('Are you sure you want to delete this image?')) {
                const index = this.images.indexOf(this.currentImage);
                if (index > -1) {
                    this.images.splice(index, 1);
                    localStorage.setItem('galleryImages', JSON.stringify(this.images));
                    this.renderGallery();
                    if (window.toast) window.toast.success('Image deleted successfully');
                }
            }
        });
        
        document.getElementById('view-fullscreen-btn')?.addEventListener('click', () => {
            if (this.currentImage) {
                const modal = document.createElement('div');
                modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; align-items:center; justify-content:center; z-index:10000; cursor:pointer;';
                const img = document.createElement('img');
                img.src = this.currentImage.src;
                img.style.cssText = 'max-width:90%; max-height:90%; object-fit:contain;';
                modal.appendChild(img);
                modal.addEventListener('click', () => document.body.removeChild(modal));
                document.body.appendChild(modal);
            }
        });
        
        document.getElementById('edit-image-btn')?.addEventListener('click', () => {
            if (window.toast) window.toast.info('Image editing feature coming soon!');
        });
    }
}

// Global gallery instance
window.galleryFunctional = new GalleryFunctional();
