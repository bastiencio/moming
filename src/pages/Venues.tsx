import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Eye, Edit, Trash2, MoreHorizontal, MapPin, ToggleLeft, ToggleRight, Globe, Building2 } from "lucide-react";
import { useVenues } from "@/hooks/useVenues";
import type { Venue } from "@/hooks/useVenues";

const Venues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "zh">("en"); // Language toggle
  
  // Form state for the venue edit/add dialog
  const [formData, setFormData] = useState({
    name_en: "",
    name_zh: "",
    country: "",
    city: "",
    location: "",
    description_en: "",
    description_zh: "",
    picture_url: "",
    active: true
  });

  const { venues, loading, createVenue, updateVenue, toggleVenueStatus, deleteVenue } = useVenues();

  // Update form data when selected venue changes
  useEffect(() => {
    if (selectedVenue) {
      setFormData({
        name_en: selectedVenue.name_en || "",
        name_zh: selectedVenue.name_zh || "",
        country: selectedVenue.country || "",
        city: selectedVenue.city || "",
        location: selectedVenue.location || "",
        description_en: selectedVenue.description_en || "",
        description_zh: selectedVenue.description_zh || "",
        picture_url: selectedVenue.picture_url || "",
        active: selectedVenue.active ?? true
      });
    } else {
      // Reset form for new venue
      setFormData({
        name_en: "",
        name_zh: "",
        country: "",
        city: "",
        location: "",
        description_en: "",
        description_zh: "",
        picture_url: "",
        active: true
      });
    }
  }, [selectedVenue, editDialogOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedVenue) {
        // Update existing venue
        await updateVenue(selectedVenue.id, formData);
      } else {
        // Create new venue
        await createVenue(formData);
      }
      setEditDialogOpen(false);
    } catch (error) {
    }
  };

  const filteredVenues = venues.filter(venue =>
    venue.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.name_zh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (venue: Venue) => {
    setSelectedVenue(venue);
    setDetailsDialogOpen(true);
  };

  const handleToggleStatus = async (venueId: string, currentStatus: boolean | null) => {
    await toggleVenueStatus(venueId, !(currentStatus ?? true));
  };

  const handleDeleteVenue = async (venueId: string, venueName: string) => {
    if (window.confirm(`Are you sure you want to delete "${venueName}"? This action cannot be undone.`)) {
      await deleteVenue(venueId);
    }
  };

  // Calculate stats
  const activeVenues = venues.filter(venue => venue.active ?? true);
  const totalVenues = venues.length;

  const VenueDetailsDialog = ({ venue }: { venue: Venue | null }) => {
    if (!venue) return null;

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {language === "en" ? venue.name_en : (venue.name_zh || venue.name_en)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {/* Language toggle */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
            >
              {language === "en" ? "中文" : "English"}
            </Button>
          </div>

          {/* Basic Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium mb-3">
              {language === "en" ? "Basic Information" : "基本信息"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "Name (English)" : "名称（英文）"}
                </label>
                <p className="text-foreground font-medium">{venue.name_en}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "Name (Chinese)" : "名称（中文）"}
                </label>
                <p className="text-foreground font-medium">{venue.name_zh || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "Country" : "国家"}
                </label>
                <p className="text-foreground">{venue.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "City" : "城市"}
                </label>
                <p className="text-foreground">{venue.city}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium mb-3">
              {language === "en" ? "Location" : "位置"}
            </h3>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {language === "en" ? "Location" : "位置"}
              </label>
              <p className="text-foreground">{venue.location || "N/A"}</p>
            </div>
          </div>

          {/* Description */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium mb-3">
              {language === "en" ? "Description" : "描述"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "Description (English)" : "描述（英文）"}
                </label>
                <p className="text-foreground">{venue.description_en || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "Description (Chinese)" : "描述（中文）"}
                </label>
                <p className="text-foreground">{venue.description_zh || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium mb-3">
              {language === "en" ? "Media" : "媒体"}
            </h3>
            {venue.picture_url ? (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "Picture" : "图片"}
                </label>
                <div className="mt-2">
                  <img 
                    src={venue.picture_url} 
                    alt={language === "en" ? venue.name_en : (venue.name_zh || venue.name_en)}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {language === "en" ? "No picture available" : "无图片"}
              </p>
            )}
          </div>

          {/* Status and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {language === "en" ? "Status" : "状态"}
              </label>
              <p className="text-foreground">
                <Badge variant={(venue.active ?? true) ? "default" : "secondary"}>
                  {(venue.active ?? true) ? 
                    (language === "en" ? "Active" : "活跃") : 
                    (language === "en" ? "Inactive" : "不活跃")}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {language === "en" ? "Created" : "创建时间"}
              </label>
              <p className="text-foreground">
                {venue.created_at ? new Date(venue.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="text-muted-foreground">
            {language === "en" ? "Loading venues..." : "加载场所..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-2">
            {language === "en" ? "Venues" : "场所"}
          </h1>
          <p className="text-muted-foreground">
            {language === "en" ? 
              "Showcase venues featuring MoMing Kombucha brand" : 
              "展示使用 MoMing Kombucha 品牌的场所"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
          >
            {language === "en" ? "中文" : "English"}
          </Button>
          <Button onClick={() => setEditDialogOpen(true)}>
            {language === "en" ? "Add Venue" : "添加场所"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Total Venues" : "总场所数"}
                </p>
                <p className="text-xl font-semibold text-foreground">{totalVenues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-success" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Active" : "活跃"}
                </p>
                <p className="text-xl font-semibold text-foreground">{activeVenues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-warning" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {language === "en" ? "Inactive" : "不活跃"}
                </p>
                <p className="text-xl font-semibold text-foreground">{totalVenues - activeVenues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-kombucha">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder={language === "en" ? 
                "Search venues by name, city, or country..." : 
                "按名称、城市或国家搜索场所..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Venues Table */}
      <Card className="shadow-kombucha">
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Venue Directory" : "场所目录"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "en" ? "Name" : "名称"}</TableHead>
                <TableHead>{language === "en" ? "City" : "城市"}</TableHead>
                <TableHead>{language === "en" ? "Country" : "国家"}</TableHead>
                <TableHead>{language === "en" ? "Status" : "状态"}</TableHead>
                <TableHead>{language === "en" ? "Actions" : "操作"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.map((venue) => (
                <TableRow key={venue.id}>
                  <TableCell className="font-medium">
                    {language === "en" ? venue.name_en : (venue.name_zh || venue.name_en)}
                  </TableCell>
                  <TableCell>{venue.city}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      {venue.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={(venue.active ?? true) ? "default" : "secondary"}>
                      {(venue.active ?? true) ? 
                        (language === "en" ? "Active" : "活跃") : 
                        (language === "en" ? "Inactive" : "不活跃")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(venue)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditVenue(venue)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(venue.id, venue.active ?? true)}
                      >
                        {(venue.active ?? true) ? (
                          <ToggleRight className="w-4 h-4 text-success" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(venue)}>
                            {language === "en" ? "View Details" : "查看详情"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditVenue(venue)}>
                            {language === "en" ? "Edit Venue" : "编辑场所"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteVenue(venue.id, venue.name_en)}
                            className="text-destructive"
                          >
                            {language === "en" ? "Delete Venue" : "删除场所"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVenues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {language === "en" ? "No venues found" : "未找到场所"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Venue Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedVenue ? 
                (language === "en" ? "Edit Venue" : "编辑场所") : 
                (language === "en" ? "Add New Venue" : "添加新场所")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-4">
              {/* Basic Information Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-3">
                  {language === "en" ? "Basic Information" : "基本信息"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">
                      {language === "en" ? "Name (English)" : "名称（英文）"} *
                    </label>
                    <Input 
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleInputChange}
                      placeholder={language === "en" ? "Enter venue name in English" : "输入英文场所名称"} 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {language === "en" ? "Name (Chinese)" : "名称（中文）"}
                    </label>
                    <Input 
                      name="name_zh"
                      value={formData.name_zh}
                      onChange={handleInputChange}
                      placeholder={language === "en" ? "Enter venue name in Chinese" : "输入中文场所名称"} 
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-3">
                  {language === "en" ? "Location" : "位置"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">
                      {language === "en" ? "Country" : "国家"} *
                    </label>
                    <Input 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder={language === "en" ? "Enter country" : "输入国家"} 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {language === "en" ? "City" : "城市"} *
                    </label>
                    <Input 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder={language === "en" ? "Enter city" : "输入城市"} 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {language === "en" ? "Location" : "位置"}
                    </label>
                    <Input 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder={language === "en" ? "Enter specific location" : "输入具体位置"} 
                    />
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-3">
                  {language === "en" ? "Description" : "描述"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">
                      {language === "en" ? "Description (English)" : "描述（英文）"}
                    </label>
                    <textarea 
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder={language === "en" ? "Enter description in English" : "输入英文描述"}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {language === "en" ? "Description (Chinese)" : "描述（中文）"}
                    </label>
                    <textarea 
                      name="description_zh"
                      value={formData.description_zh}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder={language === "en" ? "Enter description in Chinese" : "输入中文描述"}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-3">
                  {language === "en" ? "Media" : "媒体"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">
                      {language === "en" ? "Picture URL" : "图片链接"}
                    </label>
                    <Input 
                      name="picture_url"
                      value={formData.picture_url}
                      onChange={handleInputChange}
                      placeholder={language === "en" ? "Enter picture URL" : "输入图片链接"} 
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-medium">
                  {language === "en" ? "Status" : "状态"}
                </label>
                <Badge variant={formData.active ? "default" : "secondary"}>
                  {formData.active ? 
                    (language === "en" ? "Active" : "活跃") : 
                    (language === "en" ? "Inactive" : "不活跃")}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
                {language === "en" ? "Cancel" : "取消"}
              </Button>
              <Button type="submit">
                {selectedVenue ? 
                  (language === "en" ? "Update Venue" : "更新场所") : 
                  (language === "en" ? "Add Venue" : "添加场所")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Venue Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <VenueDetailsDialog venue={selectedVenue} />
      </Dialog>
    </div>
  );
};

export default Venues;