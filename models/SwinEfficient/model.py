import torch.nn.functional as F
import timm
from torchvision import models
import torch.nn as nn
import torch

class DualChannelModel(nn.Module):
    def __init__(self):
        super(DualChannelModel, self).__init__()
        
        # Load pretrained Swin Transformer
        self.swin = timm.create_model('swin_base_patch4_window7_224', pretrained=True)
        self.swin.head = nn.Identity()  # Remove Swin classifier head

        # Load pretrained EfficientNet-B0
        self.efficientnet = models.efficientnet_b0(pretrained=True)
        self.efficientnet_features = nn.Sequential(*list(self.efficientnet.children())[:-2])  # Remove classifier
        # self.efficientnet_pool = nn.AdaptiveAvgPool2d((7, 7))  # Pool to [B, 1280, 7, 7]

        # Combined feature dimensions after pooling
        combined_dim = 7 * 7 * (1024 + 1280)  # Swin [7, 7, 1024] + EfficientNet [7, 7, 1280]
        self.fc = nn.Sequential(
            nn.Linear(combined_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 1) 
        )
    
    def forward(self, x):
        # Swin Transformer pathway
        swin_features = self.swin(x)  # Shape: [B, 7, 7, 1024]
        # print(swin_features.shape)
        
        # EfficientNet pathway
        efficientnet_features = self.efficientnet_features(x)  # Output shape: [B, 1280, H, W]
        # print(efficientnet_features.shape)
        # efficientnet_features = self.efficientnet_pool(efficientnet_features)  # Shape: [B, 1280, 7, 7]
        # print(efficientnet_features.shape)
        efficientnet_features = efficientnet_features.permute(0, 2, 3, 1)  # New shape: [B, 7, 7, 1280]
        # print(efficientnet_features.shape)

        # Concatenate features
        combined_features = torch.cat((swin_features, efficientnet_features), dim=-1)  # Shape: [B, 7, 7, 2304]
        # print(combined_features.shape)
        combined_features = combined_features.view(combined_features.size(0), -1)  # Flatten to [B, 7*7*2304]
        
        # Fully connected layers
        output = self.fc(combined_features)  # Shape: [B, 1]
        
        return output

# Test the model
if __name__ == "__main__":
    model = DualChannelModel()
    x = torch.randn(1, 3, 224, 224)
    y = model(x)
    print(y.shape)
