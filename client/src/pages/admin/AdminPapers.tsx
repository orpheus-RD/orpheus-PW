import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Edit, GraduationCap, Plus, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type PaperFormData = {
  title: string;
  authors: string;
  abstract: string;
  journal: string;
  year: number;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  pdfUrl: string;
  pdfKey: string;
  category: string;
  tags: string;
  citations: number;
  featured: boolean;
  published: boolean;
};

const defaultFormData: PaperFormData = {
  title: "",
  authors: "",
  abstract: "",
  journal: "",
  year: new Date().getFullYear(),
  volume: "",
  issue: "",
  pages: "",
  doi: "",
  pdfUrl: "",
  pdfKey: "",
  category: "",
  tags: "",
  citations: 0,
  featured: false,
  published: false,
};

export default function AdminPapers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PaperFormData>(defaultFormData);

  const utils = trpc.useUtils();
  const { data: papers, isLoading } = trpc.papers.listAll.useQuery({});
  
  const createMutation = trpc.papers.create.useMutation({
    onSuccess: () => {
      utils.papers.listAll.invalidate();
      toast.success("论文创建成功");
      closeDialog();
    },
    onError: (error) => {
      toast.error("创建失败: " + error.message);
    },
  });

  const updateMutation = trpc.papers.update.useMutation({
    onSuccess: () => {
      utils.papers.listAll.invalidate();
      toast.success("论文更新成功");
      closeDialog();
    },
    onError: (error) => {
      toast.error("更新失败: " + error.message);
    },
  });

  const deleteMutation = trpc.papers.delete.useMutation({
    onSuccess: () => {
      utils.papers.listAll.invalidate();
      toast.success("论文删除成功");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error("删除失败: " + error.message);
    },
  });

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (paper: NonNullable<typeof papers>[0]) => {
    setEditingId(paper.id);
    setFormData({
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract || "",
      journal: paper.journal || "",
      year: paper.year || new Date().getFullYear(),
      volume: paper.volume || "",
      issue: paper.issue || "",
      pages: paper.pages || "",
      doi: paper.doi || "",
      pdfUrl: paper.pdfUrl || "",
      pdfKey: paper.pdfKey || "",
      category: paper.category || "",
      tags: paper.tags || "",
      citations: paper.citations || 0,
      featured: paper.featured || false,
      published: paper.published || false,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("请输入标题");
      return;
    }
    if (!formData.authors.trim()) {
      toast.error("请输入作者");
      return;
    }

    const submitData = {
      ...formData,
      publishedAt: formData.published ? new Date() : undefined,
    };

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate({ id: deletingId });
    }
  };

  const togglePublish = (paper: NonNullable<typeof papers>[0]) => {
    updateMutation.mutate({
      id: paper.id,
      published: !paper.published,
      publishedAt: !paper.published ? new Date() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-slate-900">
            学术论文
          </h1>
          <p className="text-slate-500 mt-1">
            管理您的学术论文和研究成果
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          添加论文
        </Button>
      </div>

      {/* Papers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : papers && papers.length > 0 ? (
        <div className="space-y-4">
          {papers.map((paper) => (
            <Card key={paper.id} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 leading-tight">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {paper.authors}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          paper.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {paper.published ? "已发布" : "草稿"}
                      </span>
                      {paper.featured && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                          精选
                        </span>
                      )}
                      {paper.journal && (
                        <span className="text-xs text-slate-500">
                          {paper.journal}
                        </span>
                      )}
                      {paper.year && (
                        <span className="text-xs text-slate-500">
                          {paper.year}
                        </span>
                      )}
                      {paper.doi && (
                        <a
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          DOI <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {paper.citations !== null && paper.citations > 0 && (
                        <span className="text-xs text-slate-500">
                          被引 {paper.citations} 次
                        </span>
                      )}
                    </div>
                    {paper.abstract && (
                      <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                        {paper.abstract}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePublish(paper)}
                      title={paper.published ? "取消发布" : "发布"}
                    >
                      {paper.published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(paper)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeletingId(paper.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <GraduationCap className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              暂无论文
            </h3>
            <p className="text-slate-500 mb-4">
              添加您的学术论文和研究成果
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              添加论文
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "编辑论文" : "添加论文"}
            </DialogTitle>
            <DialogDescription>
              {editingId ? "修改论文信息" : "录入新的学术论文"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">论文标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入论文标题"
              />
            </div>

            {/* Authors */}
            <div className="space-y-2">
              <Label htmlFor="authors">作者 *</Label>
              <Input
                id="authors"
                value={formData.authors}
                onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))}
                placeholder="如：Zhang, X., Li, Y., Wang, Z."
              />
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <Label htmlFor="abstract">摘要</Label>
              <Textarea
                id="abstract"
                value={formData.abstract}
                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                placeholder="论文摘要..."
                rows={4}
              />
            </div>

            {/* Journal & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journal">期刊/会议</Label>
                <Input
                  id="journal"
                  value={formData.journal}
                  onChange={(e) => setFormData(prev => ({ ...prev, journal: e.target.value }))}
                  placeholder="如：Nature, Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">年份</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                />
              </div>
            </div>

            {/* Volume, Issue, Pages */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volume">卷号</Label>
                <Input
                  id="volume"
                  value={formData.volume}
                  onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                  placeholder="如：12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue">期号</Label>
                <Input
                  id="issue"
                  value={formData.issue}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
                  placeholder="如：3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">页码</Label>
                <Input
                  id="pages"
                  value={formData.pages}
                  onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                  placeholder="如：123-145"
                />
              </div>
            </div>

            {/* DOI & PDF URL */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input
                  id="doi"
                  value={formData.doi}
                  onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                  placeholder="如：10.1000/xyz123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfUrl">PDF 链接</Label>
                <Input
                  id="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                  placeholder="PDF 下载链接"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">研究领域</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="如：机器学习、计算机视觉"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">关键词</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="用逗号分隔"
                />
              </div>
            </div>

            {/* Citations & Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">精选</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">发布</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="citations">引用次数</Label>
                <Input
                  id="citations"
                  type="number"
                  value={formData.citations}
                  onChange={(e) => setFormData(prev => ({ ...prev, citations: parseInt(e.target.value) || 0 }))}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这篇论文吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "删除中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
