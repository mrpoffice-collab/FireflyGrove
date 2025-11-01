# Marketing Screenshots Repository

This directory contains screenshots and images used for social media marketing posts across platforms like Pinterest, Facebook, and more.

## 📁 Directory Structure

```
screenshots/
├── features/           # Product feature screenshots
├── use-cases/         # Real-world usage examples
├── social-proof/      # Testimonials, user stories
├── metadata.json      # Central metadata file (REQUIRED)
└── README.md          # This file
```

## 🎯 How It Works

The **Image Selector Service** (`lib/marketing/imageSelector.ts`) automatically matches screenshots to marketing content based on:
- Keywords and tags
- Topic relevance
- Platform optimization
- Content similarity

### Workflow:
1. Add screenshots to appropriate subdirectories
2. Update `metadata.json` with image details and tags
3. Content system automatically selects best images for posts
4. Falls back to Unsplash if no suitable match

## 📝 Adding New Images

When adding a new screenshot:

1. **Save the file** to the appropriate subdirectory
2. **Update metadata.json** with the image details:

```json
{
  "filename": "features/new-feature.png",
  "url": "https://fireflygrove.app/marketing/screenshots/features/new-feature.png",
  "title": "Descriptive Title for Pinterest/Facebook",
  "description": "Detailed description of what the image shows",
  "tags": ["keyword1", "keyword2", "feature-name"],
  "platform": ["pinterest", "facebook"],
  "topics": ["main topic", "secondary topic"],
  "aspectRatio": "2:3",
  "pinterestOptimized": true,
  "uploadedAt": "2025-01-15"
}
```

### Tag Guidelines:
- **Be specific**: Use feature names, not generic terms
- **Match content keywords**: Use keywords from your content briefs
- **Include variations**: Different ways to describe the same thing
- **Think user intent**: What would users search for?

## 🎨 Image Specifications

### Pinterest (Priority Platform)
- **Aspect Ratio**: 2:3 (vertical)
- **Dimensions**: 1000x1500px (optimal)
- **File Size**: < 20MB
- **Format**: PNG or JPG
- **Quality**: High resolution, clear text

### Facebook
- **Aspect Ratio**: 1.91:1 (landscape) or 1:1 (square)
- **Dimensions**: 1200x630px or 1080x1080px
- **File Size**: < 10MB
- **Format**: PNG or JPG

### General Guidelines
- Use clear, high-contrast images
- Ensure text is readable at small sizes
- Show actual product features when possible
- Include Firefly Grove branding subtly

## 🚀 Best Practices

### Screenshot Capture Tips:
1. **Clean the UI**: Hide personal data, use demo accounts
2. **Highlight key features**: Circle or arrow to draw attention
3. **Use annotations**: Add text overlays explaining features
4. **Show value**: Demonstrate benefits, not just features
5. **Be authentic**: Real examples perform better than mockups

### Topics to Cover:
- **Features**: Dashboard, memory upload, branch organization, heir management
- **Use Cases**: Family reunions, legacy planning, photo preservation
- **Social Proof**: User testimonials, success stories (with permission)
- **How-To**: Step-by-step guides, tutorials
- **Seasonal**: Holidays, special occasions

## 📊 Repository Stats

Check current repository statistics:
```bash
# In your code:
import { getRepositoryStats } from '@/lib/marketing/imageSelector'
const stats = getRepositoryStats()
```

## 🔄 Auto-Assignment

New marketing posts automatically get images assigned based on:
1. **Content keywords** matched to image tags
2. **Topic relevance** matched to image topics
3. **Platform optimization** (Pinterest prefers vertical images)
4. **Relevance score** (minimum threshold: 20 points)

### Manual Assignment:
```bash
# Assign images to all posts without images
POST /api/marketing/posts/assign-images

# Check how many posts need images
GET /api/marketing/posts/assign-images
```

## 🎯 Platform-Specific Tips

### Pinterest
- **Vertical is king**: 2:3 aspect ratio performs 3x better
- **Text overlays**: Add compelling headlines on images
- **Bright colors**: Catch attention in feed
- **Lifestyle shots**: Show emotional benefits
- **Keyword-rich**: Optimize titles and descriptions

### Facebook
- **Square or landscape**: Mobile-friendly formats
- **Authentic photos**: Personal stories resonate
- **Less text**: Let the image speak
- **Video stills**: Screenshots from video content work well

## 🛠️ Maintenance

### Regular Tasks:
- [ ] Review image performance monthly
- [ ] Add new screenshots for new features
- [ ] Update metadata tags based on content trends
- [ ] Remove outdated screenshots
- [ ] Create Pinterest-optimized versions of top performers

### Quality Checklist:
- [ ] High resolution (no pixelation)
- [ ] Clear subject matter
- [ ] On-brand colors and style
- [ ] Readable text (if any)
- [ ] Proper aspect ratio for platform
- [ ] Metadata complete and accurate

## 📈 Analytics

Track which images perform best:
- Pinterest saves and clicks
- Facebook engagement
- Traffic to site from pins
- Conversion rates by image

Use this data to:
1. Create more images like top performers
2. Update tags on underperforming images
3. Guide future screenshot strategy

## 🆘 Troubleshooting

**Image not being selected?**
- Check tags match content keywords
- Verify platform is included in metadata
- Ensure topic is relevant
- Check file exists at URL

**Wrong image being selected?**
- Adjust tag specificity
- Update relevance scoring in `imageSelector.ts`
- Add more descriptive tags to correct image

**Need Pinterest-optimized version?**
- Crop existing screenshot to 2:3
- Add text overlay with headline
- Set `pinterestOptimized: true` in metadata

## 📚 Resources

- [Pinterest Best Practices](https://business.pinterest.com/en/blog/best-practices)
- [Facebook Image Specs](https://www.facebook.com/business/ads-guide)
- [Canva Templates](https://www.canva.com/templates/) - For creating overlays

---

**Last Updated**: 2025-01-15
**Maintainer**: Marketing Team
**Questions?** Check `lib/marketing/imageSelector.ts` for technical details
